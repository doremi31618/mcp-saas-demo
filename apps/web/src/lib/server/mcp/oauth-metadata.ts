type ProtectedResourceMetadataInput = {
	appUrl: string;
	supabaseUrl: string;
};

function withoutTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

export function buildProtectedResourceMetadata({
	appUrl,
	supabaseUrl
}: ProtectedResourceMetadataInput) {
	return {
		resource: `${withoutTrailingSlash(appUrl)}/mcp`,
		authorization_servers: [`${withoutTrailingSlash(supabaseUrl)}/auth/v1`],
		bearer_methods_supported: ['header'],
		scopes_supported: ['openid', 'email']
	};
}

export function buildWwwAuthenticate(appUrl: string): string {
	return `Bearer resource_metadata="${withoutTrailingSlash(appUrl)}/.well-known/oauth-protected-resource/mcp", scope="openid email"`;
}
