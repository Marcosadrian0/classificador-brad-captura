const jwt = require('jsonwebtoken');

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) throw new Error('Não autenticado');
  return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
}

function requireAdmin(req) {
  const user = verifyToken(req);
  if (user.role !== 'admin') throw new Error('Sem permissão');
  return user;
}

function apiError(res, e) {
  const status = ['Não autenticado', 'Sem permissão'].includes(e.message) ? 401 : 500;
  res.status(status).json({ success: false, error: e.message });
}

module.exports = { verifyToken, requireAdmin, apiError };
