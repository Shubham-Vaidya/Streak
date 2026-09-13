import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { provider } = req.query;
    
    let query = supabase.from('external_activity').select('*');
    if (provider) {
      query = query.eq('provider', provider as string);
    }
    
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
