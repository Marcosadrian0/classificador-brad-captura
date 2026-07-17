module.exports = async (req, res) => {
  const checks = { node: process.version, env: {} };
  try { require('jsonwebtoken'); checks.jsonwebtoken = 'ok'; } catch(e) { checks.jsonwebtoken = e.message; }
  try { require('bcryptjs'); checks.bcryptjs = 'ok'; } catch(e) { checks.bcryptjs = e.message; }
  checks.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN ? 'set' : 'MISSING';
  checks.env.JWT_SECRET = process.env.JWT_SECRET ? 'set' : 'MISSING';
  checks.env.GITHUB_OWNER = process.env.GITHUB_OWNER || 'MISSING';
  checks.env.GITHUB_REPO = process.env.GITHUB_REPO || 'MISSING';
  res.json({ success: true, checks });
};
