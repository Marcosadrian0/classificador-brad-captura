const bcrypt = require('bcryptjs');
const { requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'PUT') {
      requireAdmin(req);
      const { name, email, password, role, client } = req.body || {};
      const username = (email || '').toLowerCase().trim();
      const file = await read('users');
      const idx = file.list.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

      const user = { ...file.list[idx], name: name.trim(), username, email: username, role, client: client || null };
      if (password) user.password_hash = await bcrypt.hash(password, 10);

      file.list[idx] = user;
      await write('users', file.list, file.sha, `update: usuário ${user.email}`);

      const { password_hash, ...safe } = user;
      return res.json({ success: true, user: safe });
    }

    if (req.method === 'PATCH') {
      requireAdmin(req);
      const { manager } = req.body || {};
      const file = await read('users');
      const idx = file.list.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      file.list[idx] = { ...file.list[idx], manager: manager || null };
      await write('users', file.list, file.sha, `manager: ${file.list[idx].email} -> ${manager || 'none'}`);
      const { password_hash, ...safe } = file.list[idx];
      return res.json({ success: true, user: safe });
    }

    if (req.method === 'DELETE') {
      const caller = requireAdmin(req);
      if (caller.id === id) return res.status(400).json({ success: false, error: 'Não é possível excluir seu próprio usuário' });

      const file = await read('users');
      const user = file.list.find(u => u.id === id);
      if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

      await write('users', file.list.filter(u => u.id !== id), file.sha, `delete: usuário ${user.email}`);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
