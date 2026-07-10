const bcrypt = require('bcryptjs');
const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { setupToken, adminEmail, adminName, adminPassword } = req.body;
  if (!process.env.SETUP_TOKEN || setupToken !== process.env.SETUP_TOKEN) {
    return res.status(403).json({ success: false, error: 'Token inválido' });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS form_fields (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        field_type TEXT NOT NULL,
        options JSONB,
        required BOOLEAN NOT NULL DEFAULT false,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS form_assignments (
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (form_id, user_id)
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS response_values (
        id SERIAL PRIMARY KEY,
        response_id INTEGER NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
        field_id INTEGER NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
        value TEXT
      )
    `);

    if (adminEmail && adminPassword) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await db.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')
         ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = 'admin'`,
        [adminName || 'Administrador', adminEmail.toLowerCase(), hash]
      );
    }

    res.json({ success: true, message: 'Banco de dados configurado com sucesso.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
