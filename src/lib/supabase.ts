import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
	auth: {
		flowType: 'pkce',
		autoRefreshToken: true,
		detectSessionInUrl: true,
		persistSession: true,
	},
});
