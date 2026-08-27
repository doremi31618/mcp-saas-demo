import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabasePublicConfig } from './config';

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
	if (!browserClient) {
		const { supabaseUrl, publishableKey } = getSupabasePublicConfig();
		browserClient = createClient(supabaseUrl, publishableKey);
	}

	return browserClient;
}

export function createSupabaseTokenClient(accessToken: string): SupabaseClient {
	const { supabaseUrl, publishableKey } = getSupabasePublicConfig();
	return createClient(supabaseUrl, publishableKey, {
		accessToken: async () => accessToken,
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		}
	});
}
