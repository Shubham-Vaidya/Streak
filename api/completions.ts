import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { habit_id, date, completed } = req.body;
    const id = `${habit_id}_${date}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('habit_completions')
      .upsert({
        id,
        habit_id,
        date,
        completed,
        updated_at: now
      }, { onConflict: 'habit_id, date' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
