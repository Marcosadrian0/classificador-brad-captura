const bcrypt = require('bcryptjs');
const { verifyToken, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const payload = verifyToken(req);
      const { list: users } = await read('users');
      const user = users.find(u => u.id === payload.id);
      if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      const { password_hash, ...safe } = user;
      return res.json({ success: true, user: safe });
    }

    if (req.method === 'POST') {
      const payload = verifyToken(req);
      const { new_password } = req.body || {};
      if (!new_password || new_password.length < 4) {
        return res.status(400).json({ success: false, error: 'Senha deve ter ao menos 4 caracteres' });
      }
      const file = await read('users');
      const idx = file.list.findIndex(u => u.id === payload.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      const hash = await bcrypt.hash(new_password, 10);
      file.list[idx] = { ...file.list[idx], password_hash: hash, must_change_password: false };
      await write('users', file.list, file.sha, `change-password: ${file.list[idx].username}`);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
