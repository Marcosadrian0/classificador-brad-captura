const { randomUUID } = require('crypto');
const { verifyToken, apiError } = require('../../../lib/auth');
const { read, write } = require('../../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.query;
  try {
    const user = verifyToken(req);
    const { list: forms } = await read('forms');
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
    return res.json({ success: true, response });
  } catch (e) {
    apiError(res, e);
  }
};
