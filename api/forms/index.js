const { randomUUID } = require('crypto');
const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const user = verifyToken(req);
      const { list: forms } = await read('forms');

      if (user.role === 'admin') {
        const { list: responses } = await read('responses');
        const enriched = forms.map(f => ({
          ...f,
          assigned_count: (f.assigned_user_ids || []).length,
          response_count: responses.filter(r => r.form_id === f.id).length
        })).sort((a, b) => b.created_at.localeCompare(a.created_at));
        return res.json({ success: true, forms: enriched });
      }

      const { list: responses } = await read('responses');
      const myForms = forms
        .filter(f => f.is_active && (f.assigned_user_ids || []).includes(user.id))
        .map(f => ({
          id: f.id, title: f.title, description: f.description, created_at: f.created_at,
          already_responded: responses.some(r => r.form_id === f.id && r.user_id === user.id)
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return res.json({ success: true, forms: myForms });
    }

    if (req.method === 'POST') {
      const admin = requireAdmin(req);
      const { title, description, fields = [], userIds = [], triggers = [] } = req.body || {};
      if (!title) return res.status(400).json({ success: false, error: 'Título obrigatório' });

      const form = {
        id: randomUUID(),
        title: title.trim(),
        description: description || null,
        is_active: true,
        created_by: admin.id,
        created_at: new Date().toISOString(),
        fields: fields.map((f, i) => ({
          id: randomUUID(),
          label: f.label,
          field_type: f.type || f.field_type,
          options: f.options || null,
          required: !!f.required,
          order_index: i
        })),
        assigned_user_ids: userIds,
        triggers: triggers.filter(t => t.target_form_id && t.condition)
      };

      const file = await read('forms');
      await write('forms', [...file.list, form], file.sha, `add: formulário "${form.title}"`);
      return res.status(201).json({ success: true, form });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
