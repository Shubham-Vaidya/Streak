import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('integrations').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { id, ...integration } = req.body;
    
    // id and provider should be identical
    const { data, error } = await supabase
      .from('integrations')
      .upsert({ id, ...integration }, { onConflict: 'id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query; // e.g. provider name
    if (!id) return res.status(400).json({ error: 'Missing integration id' });

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id as string);

    if (error) return res.status(500).json({ error: error.message });
    
    // Also delete external activity
    await supabase.from('external_activity').delete().eq('provider', id as string);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
