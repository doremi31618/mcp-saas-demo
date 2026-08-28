import { describe, expect, it } from 'vitest';

import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
	it('keeps local OAuth consent redirects and rejects external redirect targets', () => {
		expect(safeRedirectPath('/oauth/consent?authorization_id=auth-123')).toBe(
			'/oauth/consent?authorization_id=auth-123'
		);
		expect(safeRedirectPath('https://attacker.example/steal')).toBe('/notes');
		expect(safeRedirectPath('//attacker.example/steal')).toBe('/notes');
	});
});
