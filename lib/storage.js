const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER || 'Marcosadrian0';
const REPO = process.env.GITHUB_REPO || 'classificador-brad-captura';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data`;

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function read(name) {
  const res = await fetch(`${BASE}/${name}.json?ref=${BRANCH}`, { headers: headers() });
  if (res.status === 404) return { list: [], sha: null };
  if (!res.ok) throw new Error(`Erro ao ler ${name}: ${res.status}`);
  const json = await res.json();
  const list = JSON.parse(Buffer.from(json.content, 'base64').toString('utf8'));
  return { list, sha: json.sha };
}

async function write(name, list, sha, message) {
  const content = Buffer.from(JSON.stringify(list, null, 2) + '\n').toString('base64');
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${BASE}/${name}.json`, {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao salvar ${name}: ${res.status}`);
  }
}

module.exports = { read, write };
