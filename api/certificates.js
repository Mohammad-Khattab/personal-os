const { supabase } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('target_date', { ascending: true, nullsFirst: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { name, platform, status, progress_percent, target_date, notes } = req.body;
    if (!name || !platform) return res.status(400).json({ error: 'name and platform required' });
    const { data, error } = await supabase
      .from('certificates')
      .insert({ name, platform, status: status || 'not_started', progress_percent: progress_percent || 0, target_date: target_date || null, notes: notes || null })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { name, platform, status, progress_percent, target_date, notes } = req.body;
    const { data, error } = await supabase
      .from('certificates')
      .update({ name, platform, status, progress_percent, target_date, notes })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ deleted: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
