const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      requireAdmin(req);
      const { list: users } = await read('users');
      const safe = users.map(({ password_hash, ...u }) => u).sort((a, b) => a.name.localeCompare(b.name));
      return res.json({ success: true, users: safe });
    }

    if (req.method === 'POST') {
      requireAdmin(req);
      const { name, email, password, role = 'user' } = req.body || {};
      const username = (email || '').toLowerCase().trim();
      if (!name || !username || !password) return res.status(400).json({ success: false, error: 'Nome, usuário e senha são obrigatórios' });
      if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, error: 'Role inválida' });

      const file = await read('users');
      if (file.list.find(u => u.username === username || u.email === username)) {
        return res.status(409).json({ success: false, error: 'Este usuário já está cadastrado' });
      }

      const user = {
        id: randomUUID(),
        name: name.trim(),
        username,
        email: username,
        password_hash: await bcrypt.hash(password, 10),
        role,
        created_at: new Date().toISOString()
      };

      await write('users', [...file.list, user], file.sha, `add: usuário ${user.email}`);
      const { password_hash, ...safe } = user;
      return res.status(201).json({ success: true, user: safe });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
