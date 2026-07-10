const { verifyToken, requireAdmin, apiError } = require('../../lib/auth');
const { read, write } = require('../../lib/storage');
const crypto = require('crypto');

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const user = verifyToken(req);
      const { message } = req.body || {};
      if (!message || !String(message).trim()) return res.status(400).json({ success: false, error: 'Mensagem vazia' });

      const { list, sha } = await read('support');
      const msg = {
        id: crypto.randomUUID(),
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        message: String(message).trim(),
        sent_at: new Date().toISOString(),
        from: 'user',
        read: false
      };
      list.push(msg);
      await write('support', list, sha, `support: message from ${user.name}`);
      return res.json({ success: true, msg });
    }

    if (req.method === 'GET') {
      const user = verifyToken(req);
      const { list } = await read('support');
      if (user.role === 'admin') {
        // Group by user, return all
        return res.json({ success: true, messages: list });
      }
      // Regular user: return only their thread
      const thread = list.filter(m => m.user_id === user.id || (m.from === 'admin' && m.target_user_id === user.id));
      return res.json({ success: true, messages: thread });
    }

    if (req.method === 'PATCH') {
      // Admin marks thread as concluded
      const admin = requireAdmin(req);
      const { target_user_id, concluded } = req.body || {};
      if (!target_user_id) return res.status(400).json({ success: false, error: 'Dados inválidos' });

      const { list, sha } = await read('support');
      // Remove any previous concluded markers for this thread, then add/remove
      const filtered = list.filter(m => !(m.from === 'system' && m.target_user_id === target_user_id));
      if (concluded !== false) {
        filtered.push({
          id: crypto.randomUUID(),
          from: 'system',
          target_user_id,
          concluded: true,
          sent_at: new Date().toISOString()
        });
      }
      await write('support', filtered, sha, `support: thread concluded by ${admin.name}`);
      return res.json({ success: true });
    }

    if (req.method === 'PUT') {
      // Admin reply
      const admin = requireAdmin(req);
      const { target_user_id, target_user_name, message } = req.body || {};
      if (!message || !target_user_id) return res.status(400).json({ success: false, error: 'Dados inválidos' });

      const { list, sha } = await read('support');
      const msg = {
        id: crypto.randomUUID(),
        user_id: admin.id,
        user_name: admin.name,
        target_user_id,
        target_user_name,
        message: String(message).trim(),
        sent_at: new Date().toISOString(),
        from: 'admin',
        read: false
      };
      list.push(msg);
      await write('support', list, sha, `support: admin reply to ${target_user_name}`);
      return res.json({ success: true, msg });
    }

    res.status(405).end();
  } catch (e) {
    apiError(res, e);
  }
};
