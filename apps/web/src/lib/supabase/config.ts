import { env } from '$env/dynamic/public';

export type SupabasePublicConfig = {
	supabaseUrl: string;
	publishableKey: string;
	appUrl: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig {
	const supabaseUrl = env.PUBLIC_SUPABASE_URL;
	const publishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
	const appUrl = env.PUBLIC_APP_URL;

	if (!supabaseUrl || !publishableKey || !appUrl) {
		throw new Error(
			'Missing PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, or PUBLIC_APP_URL'
		);
	}

	return { supabaseUrl, publishableKey, appUrl };
}
