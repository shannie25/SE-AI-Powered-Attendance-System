// controllers/notificationController.js
// Assumes you have a db pool exported from config/db (mysql2/promise or similar)

const db = require('../config/db');; // adapt if your project exports differently

// helper to map role -> table and id field
function tableForRole(role) {
  if (role === 'Parent') return { table: 'Parent_Guardian', idField: 'parentID' };
  if (role === 'Student') return { table: 'Student', idField: 'studentID' };
  if (role === 'Teacher') return { table: 'Teacher', idField: 'teacherID' };
  return null;
}

exports.getPreferences = async (req, res) => {
  try {
    // expects: { role: 'Parent'|'Student'|'Teacher', id: '...' }
    const { role, id } = req.query;
    const meta = tableForRole(role);
    if (!meta) return res.status(400).json({ ok:false, msg:'Invalid role' });

    const sql = `SELECT absence_alert, late_alert, daily_summary, weekly_summary FROM ${meta.table} WHERE ${meta.idField} = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [id]);
    if (!rows.length) return res.status(404).json({ ok:false, msg:'Not found' });

    const r = rows[0];
    // convert numeric to boolean
    res.json({ ok:true, prefs: {
      absence_alert: !!r.absence_alert,
      late_alert: !!r.late_alert,
      daily_summary: !!r.daily_summary,
      weekly_summary: !!r.weekly_summary
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, msg: err.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    // expects JSON: { role, id, prefs: { absence_alert, late_alert, daily_summary, weekly_summary } }
    const { role, id, prefs } = req.body;
    const meta = tableForRole(role);
    if (!meta) return res.status(400).json({ ok:false, msg:'Invalid role' });

    const keys = ['absence_alert','late_alert','daily_summary','weekly_summary'];
    const updates = [];
    const values = [];
    keys.forEach(k => {
      if (k in prefs) {
        updates.push(`${k} = ?`);
        values.push(prefs[k] ? 1 : 0);
      }
    });
    if (!updates.length) return res.status(400).json({ ok:false, msg:'No prefs provided' });

    const sql = `UPDATE ${meta.table} SET ${updates.join(', ')} WHERE ${meta.idField} = ?`;
    values.push(id);
    const [result] = await db.execute(sql, values);
    res.json({ ok:true, msg:'Preferences updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, msg: err.message });
  }
};
