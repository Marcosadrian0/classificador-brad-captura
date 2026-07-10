const { requireAdmin, apiError } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    requireAdmin(req);
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ success: false, error: 'formId obrigatório' });

    const { rows: [form] } = await db.query('SELECT title FROM forms WHERE id=$1', [formId]);
    const { rows: fields } = await db.query('SELECT * FROM form_fields WHERE form_id=$1 ORDER BY sort_order', [formId]);
    const { rows: responses } = await db.query(`
      SELECT r.id, r.submitted_at, u.name AS user_name, u.email AS user_email
      FROM responses r JOIN users u ON r.user_id = u.id
      WHERE r.form_id = $1 ORDER BY u.name
    `, [formId]);

    for (const resp of responses) {
      const { rows: vals } = await db.query('SELECT field_id, value FROM response_values WHERE response_id=$1', [resp.id]);
      resp.values = Object.fromEntries(vals.map(v => [v.field_id, v.value]));
    }

    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['Nome', 'Email', 'Data de envio', ...fields.map(f => f.label)];
    const rows = responses.map(r => [
      r.user_name, r.user_email,
      new Date(r.submitted_at).toLocaleString('pt-BR'),
      ...fields.map(f => {
        const v = r.values[f.id] || '';
        return v.includes('||') ? v.split('||').join(', ') : v;
      })
    ]);

    const csv = [headers, ...rows].map(row => row.map(esc).join(',')).join('\r\n');
    const filename = `${(form?.title || 'respostas').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('﻿' + csv);
  } catch (e) {
    apiError(res, e);
  }
};
