import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// We use the service role key to bypass RLS in the server environment.
// The browser NEVER connects to Supabase directly.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
