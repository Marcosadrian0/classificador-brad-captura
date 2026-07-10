const { verifyToken, apiError } = require('../../../lib/auth');
const db = require('../../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.query;
  try {
    const user = verifyToken(req);
    const { rows: assigned } = await db.query(
      'SELECT 1 FROM form_assignments WHERE form_id=$1 AND user_id=$2', [id, user.id]
    );
    if (!assigned.length && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Sem acesso a este formulário' });
    }

    const { values = {} } = req.body || {};
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const { rows: [existing] } = await client.query(
        'SELECT id FROM responses WHERE form_id=$1 AND user_id=$2', [id, user.id]
      );
      if (existing) {
        await client.query('DELETE FROM response_values WHERE response_id=$1', [existing.id]);
        await client.query('DELETE FROM responses WHERE id=$1', [existing.id]);
      }
      const { rows: [response] } = await client.query(
        'INSERT INTO responses (form_id, user_id) VALUES ($1,$2) RETURNING *', [id, user.id]
      );
      for (const [fieldId, value] of Object.entries(values)) {
        const val = Array.isArray(value) ? value.join('||') : String(value ?? '');
        await client.query(
          'INSERT INTO response_values (response_id, field_id, value) VALUES ($1,$2,$3)',
          [response.id, fieldId, val]
        );
      }
      await client.query('COMMIT');
      return res.json({ success: true, response });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    apiError(res, e);
  }
};
