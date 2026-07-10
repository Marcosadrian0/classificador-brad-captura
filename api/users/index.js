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
      if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios' });
      if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, error: 'Role inválida' });

      const file = await read('users');
      if (file.list.find(u => u.email === email.toLowerCase().trim())) {
        return res.status(409).json({ success: false, error: 'Este email já está cadastrado' });
      }

      const user = {
        id: randomUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
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
