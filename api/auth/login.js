const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read } = require('../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email e senha obrigatórios' });

    const { list: users } = await read('users');
    const login = email.toLowerCase().trim();
    const user = users.find(u => u.username === login || u.email === login);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
