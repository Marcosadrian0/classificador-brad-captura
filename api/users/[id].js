const bcrypt = require('bcryptjs');
const { requireAdmin, verifyToken, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'PUT') {
      requireAdmin(req);
      const { name, email, password, role } = req.body || {};
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET name=$1, email=$2, password_hash=$3, role=$4 WHERE id=$5', [name, email.toLowerCase(), hash, role, id]);
      } else {
        await db.query('UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4', [name, email.toLowerCase(), role, id]);
      }
      const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id=$1', [id]);
      return res.json({ success: true, user: rows[0] });
    }

    if (req.method === 'DELETE') {
      const caller = requireAdmin(req);
      if (String(caller.id) === String(id)) return res.status(400).json({ success: false, error: 'Não é possível excluir seu próprio usuário' });
      await db.query('DELETE FROM users WHERE id=$1', [id]);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
