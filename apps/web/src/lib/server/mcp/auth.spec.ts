import { describe, expect, it, vi } from 'vitest';

import { authenticateMcpRequest, McpAuthenticationError } from './auth';

describe('authenticateMcpRequest', () => {
	it('verifies a bearer token for the Supabase issuer and authenticated audience', async () => {
		const verify = vi.fn().mockResolvedValue({
			sub: 'user-123',
			email: 'eric@example.com',
			role: 'authenticated'
		});

		await expect(
			authenticateMcpRequest({
				authorizationHeader: 'Bearer signed-token',
				supabaseUrl: 'https://demo.supabase.co/',
				verify
			})
		).resolves.toEqual({
			accessToken: 'signed-token',
			userId: 'user-123',
			email: 'eric@example.com'
		});

		expect(verify).toHaveBeenCalledWith('signed-token', {
			issuer: 'https://demo.supabase.co/auth/v1',
			audience: 'authenticated',
			jwksUrl: 'https://demo.supabase.co/auth/v1/.well-known/jwks.json'
		});
	});
});

it('rejects requests without a bearer token before JWT verification', async () => {
	const verify = vi.fn();

	await expect(
		authenticateMcpRequest({
			authorizationHeader: null,
			supabaseUrl: 'https://demo.supabase.co',
			verify
		})
	).rejects.toBeInstanceOf(McpAuthenticationError);
	expect(verify).not.toHaveBeenCalled();
});

it('rejects verified JWTs that are not authenticated user tokens', async () => {
	const verify = vi.fn().mockResolvedValue({ sub: 'user-123', role: 'anon' });

	await expect(
		authenticateMcpRequest({
			authorizationHeader: 'Bearer signed-token',
			supabaseUrl: 'https://demo.supabase.co',
			verify
		})
	).rejects.toBeInstanceOf(McpAuthenticationError);
});
