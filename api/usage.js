const { supabase } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('usage_entries').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'PUT') {
    const { service } = req.query;
    if (!service) return res.status(400).json({ error: 'service required' });
    const { used_value, max_value, reset_date } = req.body;
    const { data, error } = await supabase
      .from('usage_entries')
      .update({ used_value, max_value, reset_date, updated_at: new Date().toISOString() })
      .eq('service', service)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
