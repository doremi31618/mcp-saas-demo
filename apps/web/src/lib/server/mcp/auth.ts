import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

type VerifyOptions = {
	issuer: string;
	audience: string;
	jwksUrl: string;
};

type VerifyToken = (token: string, options: VerifyOptions) => Promise<JWTPayload>;

type AuthenticateMcpRequestInput = {
	authorizationHeader: string | null;
	supabaseUrl: string;
	verify?: VerifyToken;
};

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export class McpAuthenticationError extends Error {
	constructor(message = 'A valid bearer token is required') {
		super(message);
		this.name = 'McpAuthenticationError';
	}
}

function withoutTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

async function verifyWithSupabase(token: string, options: VerifyOptions): Promise<JWTPayload> {
	let jwks = jwksByUrl.get(options.jwksUrl);
	if (!jwks) {
		jwks = createRemoteJWKSet(new URL(options.jwksUrl));
		jwksByUrl.set(options.jwksUrl, jwks);
	}

	const { payload } = await jwtVerify(token, jwks, {
		issuer: options.issuer,
		audience: options.audience
	});

	return payload;
}

export async function authenticateMcpRequest({
	authorizationHeader,
	supabaseUrl,
	verify = verifyWithSupabase
}: AuthenticateMcpRequestInput) {
	const bearerMatch = authorizationHeader?.match(/^Bearer\s+(\S+)$/i);
	if (!bearerMatch) {
		throw new McpAuthenticationError();
	}

	const accessToken = bearerMatch[1];
	const baseUrl = withoutTrailingSlash(supabaseUrl);
	const payload = await verify(accessToken, {
		issuer: `${baseUrl}/auth/v1`,
		audience: 'authenticated',
		jwksUrl: `${baseUrl}/auth/v1/.well-known/jwks.json`
	});
	if (
		payload.role !== 'authenticated' ||
		typeof payload.sub !== 'string' ||
		typeof payload.email !== 'string'
	) {
		throw new McpAuthenticationError('The bearer token is not an authenticated user token');
	}

	return {
		accessToken,
		userId: payload.sub,
		email: payload.email
	};
}
