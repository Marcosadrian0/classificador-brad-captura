const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const user = verifyToken(req);

      if (user.role === 'admin') {
        const { rows } = await db.query(`
          SELECT f.id, f.title, f.description, f.is_active, f.created_at,
            u.name AS creator_name,
            COUNT(DISTINCT fa.user_id) AS assigned_count,
            COUNT(DISTINCT r.id) AS response_count
          FROM forms f
          LEFT JOIN users u ON f.created_by = u.id
          LEFT JOIN form_assignments fa ON fa.form_id = f.id
          LEFT JOIN responses r ON r.form_id = f.id
          GROUP BY f.id, u.name
          ORDER BY f.created_at DESC
        `);
        return res.json({ success: true, forms: rows });
      }

      const { rows } = await db.query(`
        SELECT f.id, f.title, f.description, f.created_at,
          EXISTS(SELECT 1 FROM responses r WHERE r.form_id = f.id AND r.user_id = $1) AS already_responded
        FROM forms f
        JOIN form_assignments fa ON fa.form_id = f.id
        WHERE fa.user_id = $1 AND f.is_active = true
        ORDER BY f.created_at DESC
      `, [user.id]);
      return res.json({ success: true, forms: rows });
    }

    if (req.method === 'POST') {
      const admin = requireAdmin(req);
      const { title, description, fields = [], userIds = [] } = req.body || {};
      if (!title) return res.status(400).json({ success: false, error: 'Título obrigatório' });

      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        const { rows: [form] } = await client.query(
          'INSERT INTO forms (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
          [title.trim(), description || null, admin.id]
        );
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await client.query(
            'INSERT INTO form_fields (form_id, label, field_type, options, required, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
            [form.id, f.label, f.type, f.options ? JSON.stringify(f.options) : null, !!f.required, i]
          );
        }
        for (const uid of userIds) {
          await client.query(
            'INSERT INTO form_assignments (form_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
            [form.id, uid]
          );
        }
        await client.query('COMMIT');
        return res.status(201).json({ success: true, form });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
