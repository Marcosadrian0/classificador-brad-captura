const { requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');

module.exports = async (req, res) => {
  const { id } = req.query;
  try {
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
