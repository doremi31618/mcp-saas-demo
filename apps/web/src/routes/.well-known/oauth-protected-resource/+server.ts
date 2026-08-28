import { json } from '@sveltejs/kit';

import { buildProtectedResourceMetadata } from '$lib/server/mcp/oauth-metadata';
import { getSupabasePublicConfig } from '$lib/supabase/config';

export function GET() {
	const { appUrl, supabaseUrl } = getSupabasePublicConfig();
	return json(buildProtectedResourceMetadata({ appUrl, supabaseUrl }));
}
