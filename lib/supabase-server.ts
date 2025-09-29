import { createClient } from '@supabase/supabase-js';
import { Agent, fetch as undiciFetch } from 'undici';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseKey) {
  throw new Error('Missing Supabase credentials. Provide SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const agent = new Agent({
  connect: {
    rejectUnauthorized: false
  },
  headersTimeout: 30000,
  bodyTimeout: 30000
});

const fetchWithAgent: typeof fetch = (input, init) => {
  return undiciFetch(input, {
    ...init,
    dispatcher: agent
  });
};

// Cliente Supabase específico para el servidor (endpoints API)
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetchWithAgent,
      headers: {
        'User-Agent': 'TuriGest/1.0'
      }
    }
  }
);
