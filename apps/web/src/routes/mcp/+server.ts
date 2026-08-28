import type { RequestHandler } from './$types';

import { authenticateMcpRequest } from '$lib/server/mcp/auth';
import { buildWwwAuthenticate } from '$lib/server/mcp/oauth-metadata';
import { createNotesMcpHandler } from '$lib/server/mcp/server';
import { createSupabaseNotesStore } from '$lib/server/notes-store';
import { createSupabaseTokenClient } from '$lib/supabase/client';
import { getSupabasePublicConfig } from '$lib/supabase/config';

const handle: RequestHandler = async ({ request }) => {
	const { appUrl, supabaseUrl } = getSupabasePublicConfig();
	let identity: Awaited<ReturnType<typeof authenticateMcpRequest>>;

	try {
		identity = await authenticateMcpRequest({
			authorizationHeader: request.headers.get('authorization'),
			supabaseUrl
		});
	} catch {
		return new Response(JSON.stringify({ error: 'unauthorized' }), {
			status: 401,
			headers: {
				'content-type': 'application/json',
				'www-authenticate': buildWwwAuthenticate(appUrl)
			}
		});
	}

	const supabase = createSupabaseTokenClient(identity.accessToken);
	const handler = createNotesMcpHandler({
		identity: { userId: identity.userId, email: identity.email },
		notes: createSupabaseNotesStore(supabase, identity.userId)
	});

	return handler.fetch(request);
};

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
