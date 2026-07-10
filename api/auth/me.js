const { verifyToken, apiError } = require('../../lib/auth');
const { read } = require('../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const payload = verifyToken(req);
    const { list: users } = await read('users');
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    const { password_hash, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (e) {
    apiError(res, e);
  }
};
