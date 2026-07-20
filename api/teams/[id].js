const { requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
    if (req.method === 'PATCH') {
      requireAdmin(req);
      const { name } = req.body || {};
      if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Nome obrigatório' });
      const file = await read('teams');
      const idx = file.list.findIndex(t => t.id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Equipe não encontrada' });
      file.list[idx] = { ...file.list[idx], name: name.trim() };
      await write('teams', file.list, file.sha, `team: renomeada para "${name.trim()}"`);
      return res.json({ success: true, team: file.list[idx] });
    }

    if (req.method === 'DELETE') {
      requireAdmin(req);
      const file = await read('teams');
      const team = file.list.find(t => t.id === id);
      if (!team) return res.status(404).json({ success: false, error: 'Equipe não encontrada' });
      await write('teams', file.list.filter(t => t.id !== id), file.sha, `team: removida equipe "${team.name}"`);
      return res.json({ success: true });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
