const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { read, write } = require('../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { setupToken, adminEmail, adminName, adminPassword } = req.body || {};
  if (!process.env.SETUP_TOKEN || setupToken !== process.env.SETUP_TOKEN) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }

  try {
    const usersFile = await read('users');
    const formsFile = await read('forms');
    const responsesFile = await read('responses');

    if (!formsFile.sha) {
      await write('forms', [], null, 'init: arquivo de formulários');
    }
    if (!responsesFile.sha) {
      await write('responses', [], null, 'init: arquivo de respostas');
    }

    if (adminEmail && adminPassword) {
      const users = usersFile.list;
      const hash = await bcrypt.hash(adminPassword, 10);
      const existing = users.find(u => u.email === adminEmail.toLowerCase());

      if (existing) {
        existing.password_hash = hash;
        existing.name = adminName || existing.name;
        existing.role = 'admin';
        if (!existing.username) existing.username = adminEmail.toLowerCase().split('@')[0];
        await write('users', users, usersFile.sha, `update: admin ${adminEmail}`);
      } else {
        const adminUsername = adminEmail.toLowerCase().split('@')[0];
        users.push({
          id: randomUUID(),
          name: adminName || 'Administrador',
          username: adminUsername,
          email: adminEmail.toLowerCase(),
          password_hash: hash,
          role: 'admin',
          created_at: new Date().toISOString()
        });
        await write('users', users, usersFile.sha, `init: admin ${adminEmail}`);
      }
    } else if (!usersFile.sha) {
      await write('users', [], null, 'init: arquivo de usuários');
    }

    res.json({ success: true, message: 'Setup concluído com sucesso.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
