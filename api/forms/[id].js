const { randomUUID } = require('crypto');
const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

function evalTrigger(trigger, values, fields) {
  const { condition, field_ids = [] } = trigger;
  const isNao = v => {
    const s = String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().split('||')[0];
    return s === 'NAO' || s === 'NÃO';
  };
  const targets = field_ids.length ? fields.filter(f => field_ids.includes(f.id)) : fields;
  if (condition === 'any_nao') return targets.some(f => isNao(values[f.id]));
  if (condition === 'all_nao') return targets.every(f => isNao(values[f.id]));
  return false;
}

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      // Public mode: no auth required
      if (req.query.public === '1') {
        const { list: forms } = await read('forms');
        const form = forms.find(f => f.id === id);
        if (!form || form.is_active === false) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });
        const { assigned_user_ids, triggers, created_by, ...pub } = form;
        return res.json({ success: true, form: pub });
      }

      const user = verifyToken(req);
      const { list: forms } = await read('forms');
      const form = forms.find(f => f.id === id);
      if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      if (user.role !== 'admin' && !(form.assigned_user_ids || []).includes(user.id)) {
        return res.status(403).json({ success: false, error: 'Sem acesso a este formulário' });
      }

      let myResponse = null;
      if (user.role !== 'admin') {
        const { list: responses } = await read('responses');
        const resp = responses.find(r => r.form_id === id && r.user_id === user.id);
        if (resp) myResponse = { submitted_at: resp.submitted_at, values: resp.values };
      }

      return res.json({ success: true, form: { ...form, myResponse } });
    }

    if (req.method === 'POST') {
      const { values = {}, guest_name, guest_email } = req.body || {};

      // Public submission: no token, but must supply name + @sbk.com.br email
      const isPublic = !req.headers.authorization;
      if (isPublic) {
        if (!guest_name || !guest_email) return res.status(400).json({ success: false, error: 'Nome e e-mail são obrigatórios' });
        const email = guest_email.trim().toLowerCase();
        if (!email.endsWith('@sbk.com.br')) return res.status(400).json({ success: false, error: 'Use seu e-mail corporativo (@sbk.com.br)' });

        const { list: forms } = await read('forms');
        const form = forms.find(f => f.id === id);
        if (!form || form.is_active === false) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

        const normalized = {};
        for (const [k, v] of Object.entries(values)) {
          normalized[k] = Array.isArray(v) ? v.join('||') : String(v ?? '');
        }

        const respFile = await read('responses');
        // One response per email per form
        const filtered = respFile.list.filter(r => !(r.form_id === id && r.guest_email === email));
        const response = {
          id: randomUUID(), form_id: id, user_id: null,
          guest_name: guest_name.trim(), guest_email: email,
          submitted_at: new Date().toISOString(), values: normalized
        };
        await write('responses', [...filtered, response], respFile.sha, `public-response: ${email} -> "${form.title}"`);
        return res.json({ success: true, response });
      }

      // Authenticated submission
      const user = verifyToken(req);
      const { list: forms, sha: formsSha } = await read('forms');
      const form = forms.find(f => f.id === id);
      if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      if (user.role !== 'admin' && !(form.assigned_user_ids || []).includes(user.id)) {
        return res.status(403).json({ success: false, error: 'Sem acesso a este formulário' });
      }

      const normalized = {};
      for (const [k, v] of Object.entries(values)) {
        normalized[k] = Array.isArray(v) ? v.join('||') : String(v ?? '');
      }

      const respFile = await read('responses');
      const filtered = respFile.list.filter(r => !(r.form_id === id && r.user_id === user.id));
      const response = {
        id: randomUUID(), form_id: id, user_id: user.id,
        submitted_at: new Date().toISOString(), values: normalized
      };
      await write('responses', [...filtered, response], respFile.sha, `response: ${user.email || user.id} -> "${form.title}"`);

      const triggered = [];
      for (const trigger of (form.triggers || [])) {
        if (!trigger.target_form_id) continue;
        const targetForm = forms.find(f => f.id === trigger.target_form_id);
        if (!targetForm) continue;
        if (evalTrigger(trigger, normalized, form.fields || [])) {
          if (!(targetForm.assigned_user_ids || []).includes(user.id)) {
            targetForm.assigned_user_ids = [...(targetForm.assigned_user_ids || []), user.id];
            triggered.push({ id: targetForm.id, title: targetForm.title });
          }
        }
      }
      if (triggered.length) {
        await write('forms', forms, formsSha, `trigger: auto-assign to ${user.email || user.id}`);
      }

      return res.json({ success: true, response, triggered });
    }

    if (req.method === 'PUT') {
      requireAdmin(req);
      const { title, description, is_active, userIds, triggers } = req.body || {};
      const file = await read('forms');
      const idx = file.list.findIndex(f => f.id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      const form = { ...file.list[idx], title, description: description || null, is_active };
      if (Array.isArray(userIds)) form.assigned_user_ids = userIds;
      if (Array.isArray(triggers)) form.triggers = triggers;

      file.list[idx] = form;
      await write('forms', file.list, file.sha, `update: formulário "${form.title}"`);
      return res.json({ success: true, form });
    }

    if (req.method === 'DELETE') {
      requireAdmin(req);
      const formsFile = await read('forms');
      const form = formsFile.list.find(f => f.id === id);
      if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      const responsesFile = await read('responses');
      await Promise.all([
        write('forms', formsFile.list.filter(f => f.id !== id), formsFile.sha, `delete: formulário "${form.title}"`),
        write('responses', responsesFile.list.filter(r => r.form_id !== id), responsesFile.sha, `delete: respostas do formulário "${form.title}"`)
      ]);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
