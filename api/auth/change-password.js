const bcrypt = require('bcryptjs');
const { verifyToken, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const user = verifyToken(req);
    const { new_password } = req.body || {};
    if (!new_password || new_password.length < 4) {
      return res.status(400).json({ success: false, error: 'Senha deve ter ao menos 4 caracteres' });
    }

    const file = await read('users');
    const idx = file.list.findIndex(u => u.id === user.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    const hash = await bcrypt.hash(new_password, 10);
    file.list[idx] = { ...file.list[idx], password_hash: hash, must_change_password: false };
    await write('users', file.list, file.sha, `change-password: ${file.list[idx].username}`);

    res.json({ success: true });
  } catch (e) {
    apiError(res, e);
  }
};
