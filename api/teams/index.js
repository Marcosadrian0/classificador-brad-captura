const { randomUUID } = require('crypto');
const { requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      requireAdmin(req);
      const { list } = await read('teams');
      return res.json({ success: true, teams: list });
    }

    if (req.method === 'POST') {
      requireAdmin(req);
      const { name } = req.body || {};
      if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Nome obrigatório' });
      const file = await read('teams');
      const team = { id: randomUUID(), name: name.trim(), created_at: new Date().toISOString() };
      await write('teams', [...file.list, team], file.sha, `team: criada equipe "${team.name}"`);
      return res.json({ success: true, team });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
