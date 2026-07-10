const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
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

    if (req.method === 'PUT') {
      requireAdmin(req);
      const { title, description, is_active, userIds } = req.body || {};
      const file = await read('forms');
      const idx = file.list.findIndex(f => f.id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      const form = { ...file.list[idx], title, description: description || null, is_active };
      if (Array.isArray(userIds)) form.assigned_user_ids = userIds;

      file.list[idx] = form;
      await write('forms', file.list, file.sha, `update: formulário "${form.title}"`);
      return res.json({ success: true, form });
    }

    if (req.method === 'DELETE') {
      requireAdmin(req);
      const formsFile = await read('forms');
      const form = formsFile.list.find(f => f.id === id);
      if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      const [responsesFile] = await Promise.all([read('responses')]);
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
