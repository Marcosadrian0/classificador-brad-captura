const { requireAdmin, apiError } = require('../../lib/auth');
const { read } = require('../../lib/storage');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    requireAdmin(req);
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ success: false, error: 'formId obrigatório' });

    const [{ list: forms }, { list: responses }, { list: users }] = await Promise.all([
      read('forms'), read('responses'), read('users')
    ]);

    const form = forms.find(f => f.id === formId);
    if (!form) return res.status(404).json({ success: false, error: 'Formulário não encontrado' });

    const fields = (form.fields || []).sort((a, b) => a.order_index - b.order_index);

    const rows = responses
      .filter(r => r.form_id === formId)
      .map(r => {
        const u = users.find(u => u.id === r.user_id) || {};
        return { user_name: u.name, user_email: u.email, submitted_at: r.submitted_at, values: r.values || {} };
      })
      .sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));

    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['Nome', 'Email', 'Data de envio', ...fields.map(f => f.label)];
    const csvRows = rows.map(r => [
      r.user_name, r.user_email,
      new Date(r.submitted_at).toLocaleString('pt-BR'),
      ...fields.map(f => {
        const v = r.values[f.id] || '';
        if (f.field_type === 'acesso' && v.includes('||')) {
          const parts = v.split('||');
          if (parts[0] === 'SIM') {
            return parts[1] ? `Acesso: SIM / Funciona: ${parts[1]}${parts[2] ? ' / Obs: '+parts[2] : ''}` : 'Acesso: SIM';
          }
          return `Acesso: NAO${parts[1] ? ' / Obs: '+parts[1] : ''}`;
        }
        return v.includes('||') ? v.split('||').join(', ') : v;
      })
    ]);

    const csv = [headers, ...csvRows].map(row => row.map(esc).join(',')).join('\r\n');
    const filename = `${(form.title).replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('﻿' + csv);
  } catch (e) {
    apiError(res, e);
  }
};
