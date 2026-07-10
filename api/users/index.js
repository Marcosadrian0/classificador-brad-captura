const bcrypt = require('bcryptjs');
const { requireAdmin, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      requireAdmin(req);
      const { rows } = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY name');
      return res.json({ success: true, users: rows });
    }

    if (req.method === 'POST') {
      requireAdmin(req);
      const { name, email, password, role = 'user' } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios' });
      if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, error: 'Role inválida' });

      const hash = await bcrypt.hash(password, 10);
      const { rows } = await db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name.trim(), email.toLowerCase().trim(), hash, role]
      );
      return res.status(201).json({ success: true, user: rows[0] });
    }

    res.status(405).end();
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ success: false, error: 'Este email já está cadastrado' });
    apiError(res, e);
  }
};
