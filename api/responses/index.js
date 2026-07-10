const { requireAdmin, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    requireAdmin(req);
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ success: false, error: 'formId obrigatório' });

    const { rows: fields } = await db.query(
      'SELECT * FROM form_fields WHERE form_id=$1 ORDER BY sort_order', [formId]
    );
    const { rows: responses } = await db.query(`
      SELECT r.id, r.submitted_at, u.id AS user_id, u.name AS user_name, u.email AS user_email
      FROM responses r
      JOIN users u ON r.user_id = u.id
      WHERE r.form_id = $1
      ORDER BY u.name
    `, [formId]);

    for (const resp of responses) {
      const { rows: vals } = await db.query('SELECT field_id, value FROM response_values WHERE response_id=$1', [resp.id]);
      resp.values = Object.fromEntries(vals.map(v => [v.field_id, v.value]));
    }

    // Also include users assigned but who haven't responded yet
    const { rows: assigned } = await db.query(`
      SELECT u.id, u.name, u.email FROM users u
      JOIN form_assignments fa ON fa.user_id = u.id
      WHERE fa.form_id = $1
      ORDER BY u.name
    `, [formId]);

    res.json({ success: true, fields, responses, assigned });
  } catch (e) {
    apiError(res, e);
  }
};
