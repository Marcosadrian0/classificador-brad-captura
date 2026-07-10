const { requireAdmin, apiError } = require('../../lib/auth');
const { read } = require('../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    requireAdmin(req);
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ success: false, error: 'formId obrigatório' });

    const [{ list: forms }, { list: responses }, { list: users }] = await Promise.all([
      read('forms'), read('responses'), read('users')
    ]);

    const form = forms.find(f => f.id === formId);
    if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

    const fields = (form.fields || []).sort((a, b) => a.order_index - b.order_index);

    const formResponses = responses
      .filter(r => r.form_id === formId)
      .map(r => {
        const u = users.find(u => u.id === r.user_id) || {};
        return { id: r.id, submitted_at: r.submitted_at, user_id: r.user_id, user_name: u.name, user_email: u.email, values: r.values };
      })
      .sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));

    const assigned = (form.assigned_user_ids || [])
      .map(uid => users.find(u => u.id === uid))
      .filter(Boolean)
      .map(({ password_hash, ...u }) => u)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ success: true, fields, responses: formResponses, assigned });
  } catch (e) {
    apiError(res, e);
  }
};
