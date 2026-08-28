import { describe, expect, it } from 'vitest';

import { buildProtectedResourceMetadata, buildWwwAuthenticate } from './oauth-metadata';

describe('buildProtectedResourceMetadata', () => {
	it('advertises the MCP resource and Supabase OAuth issuer', () => {
		expect(
			buildProtectedResourceMetadata({
				appUrl: 'https://mcp-saas-demo.vercel.app/',
				supabaseUrl: 'https://demo.supabase.co/'
			})
		).toEqual({
			resource: 'https://mcp-saas-demo.vercel.app/mcp',
			authorization_servers: ['https://demo.supabase.co/auth/v1'],
			bearer_methods_supported: ['header'],
			scopes_supported: ['openid', 'email']
		});
	});
});

describe('buildWwwAuthenticate', () => {
	it('points unauthenticated MCP clients to protected-resource discovery', () => {
		expect(buildWwwAuthenticate('https://mcp-saas-demo.vercel.app/')).toBe(
			'Bearer resource_metadata="https://mcp-saas-demo.vercel.app/.well-known/oauth-protected-resource/mcp", scope="openid email"'
		);
	});
});
