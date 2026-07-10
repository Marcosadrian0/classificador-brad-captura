const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const user = verifyToken(req);
      if (user.role !== 'admin') {
        const { rows } = await db.query('SELECT 1 FROM form_assignments WHERE form_id=$1 AND user_id=$2', [id, user.id]);
        if (!rows.length) return res.status(403).json({ success: false, error: 'Sem acesso a este formulário' });
      }
      const { rows: [form] } = await db.query('SELECT * FROM forms WHERE id=$1', [id]);
      if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

      const { rows: fields } = await db.query('SELECT * FROM form_fields WHERE form_id=$1 ORDER BY sort_order', [id]);
      const { rows: assignments } = await db.query(
        'SELECT u.id, u.name, u.email FROM users u JOIN form_assignments fa ON fa.user_id=u.id WHERE fa.form_id=$1 ORDER BY u.name',
        [id]
      );

      let myResponse = null;
      if (user.role !== 'admin') {
        const { rows: [resp] } = await db.query('SELECT * FROM responses WHERE form_id=$1 AND user_id=$2', [id, user.id]);
        if (resp) {
          const { rows: vals } = await db.query('SELECT field_id, value FROM response_values WHERE response_id=$1', [resp.id]);
          myResponse = { submitted_at: resp.submitted_at, values: Object.fromEntries(vals.map(v => [v.field_id, v.value])) };
        }
      }

      return res.json({ success: true, form: { ...form, fields, assignments, myResponse } });
    }

    if (req.method === 'PUT') {
      requireAdmin(req);
      const { title, description, is_active, userIds } = req.body || {};
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        await client.query('UPDATE forms SET title=$1, description=$2, is_active=$3 WHERE id=$4', [title, description || null, is_active, id]);
        if (Array.isArray(userIds)) {
          await client.query('DELETE FROM form_assignments WHERE form_id=$1', [id]);
          for (const uid of userIds) {
            await client.query('INSERT INTO form_assignments (form_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, uid]);
          }
        }
        await client.query('COMMIT');
        const { rows: [form] } = await db.query('SELECT * FROM forms WHERE id=$1', [id]);
        return res.json({ success: true, form });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    if (req.method === 'DELETE') {
      requireAdmin(req);
      await db.query('DELETE FROM forms WHERE id=$1', [id]);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
