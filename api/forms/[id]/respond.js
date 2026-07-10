const { randomUUID } = require('crypto');
const { verifyToken, apiError } = require('../../../lib/auth');
const { read, write } = require('../../../lib/storage');

function evalTrigger(trigger, values, fields) {
  const { condition, field_ids = [] } = trigger;
  const NAO_NORM = v => {
    const s = String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().split('||')[0];
    return s === 'NAO' || s === 'NÃO';
  };

  const targets = field_ids.length
    ? fields.filter(f => field_ids.includes(f.id))
    : fields;

  if (condition === 'any_nao') return targets.some(f => NAO_NORM(values[f.id]));
  if (condition === 'all_nao') return targets.every(f => NAO_NORM(values[f.id]));
  return false;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.query;
  try {
    const user = verifyToken(req);
    const { list: forms, sha: formsSha } = await read('forms');
    const form = forms.find(f => f.id === id);
    if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

    if (user.role !== 'admin' && !(form.assigned_user_ids || []).includes(user.id)) {
      return res.status(403).json({ success: false, error: 'Sem acesso a este formulário' });
    }

    const { values = {} } = req.body || {};
    const normalized = {};
    for (const [fieldId, value] of Object.entries(values)) {
      normalized[fieldId] = Array.isArray(value) ? value.join('||') : String(value ?? '');
    }

    const file = await read('responses');
    const filtered = file.list.filter(r => !(r.form_id === id && r.user_id === user.id));
    const response = {
      id: randomUUID(),
      form_id: id,
      user_id: user.id,
      submitted_at: new Date().toISOString(),
      values: normalized
    };

    await write('responses', [...filtered, response], file.sha, `response: ${user.email} -> "${form.title}"`);

    // Check triggers: auto-assign target forms if conditions match
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
      await write('forms', forms, formsSha, `trigger: auto-assign to ${user.email}`);
    }

    return res.json({ success: true, response, triggered });
  } catch (e) {
    apiError(res, e);
  }
};
