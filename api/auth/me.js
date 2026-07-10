const { verifyToken, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const payload = verifyToken(req);
    const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    res.json({ success: true, user: rows[0] });
  } catch (e) {
    apiError(res, e);
  }
};
