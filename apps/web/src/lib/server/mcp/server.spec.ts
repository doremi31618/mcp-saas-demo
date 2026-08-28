import { describe, expect, it, vi } from 'vitest';

import { createNotesMcpHandler } from './server';

function parseRpcResponse(body: string) {
	const dataLine = body
		.split('\n')
		.find((line) => line.startsWith('data: '))
		?.slice('data: '.length);
	return JSON.parse(dataLine ?? body);
}

async function callRpc(
	handler: ReturnType<typeof createNotesMcpHandler>,
	method: string,
	params = {}
) {
	const response = await handler.fetch(
		new Request('https://mcp-saas-demo.vercel.app/mcp', {
			method: 'POST',
			headers: {
				accept: 'application/json, text/event-stream',
				'content-type': 'application/json'
			},
			body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
		})
	);

	return parseRpcResponse(await response.text());
}

describe('notes MCP server', () => {
	it('publishes only the three MVP tools with accurate safety annotations', async () => {
		const handler = createNotesMcpHandler({
			identity: { userId: 'user-123', email: 'eric@example.com' },
			notes: { create: vi.fn(), list: vi.fn() }
		});

		const rpc = await callRpc(handler, 'tools/list');

		expect(rpc.result.tools).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'who_am_i',
					annotations: expect.objectContaining({
						readOnlyHint: true,
						destructiveHint: false,
						openWorldHint: false
					})
				}),
				expect.objectContaining({
					name: 'create_note',
					annotations: expect.objectContaining({
						readOnlyHint: false,
						destructiveHint: false,
						openWorldHint: false
					})
				}),
				expect.objectContaining({
					name: 'list_notes',
					annotations: expect.objectContaining({
						readOnlyHint: true,
						destructiveHint: false,
						openWorldHint: false
					})
				})
			])
		);
		expect(rpc.result.tools).toHaveLength(3);
	});

	it('returns the authenticated identity from who_am_i', async () => {
		const handler = createNotesMcpHandler({
			identity: { userId: 'user-123', email: 'eric@example.com' },
			notes: { create: vi.fn(), list: vi.fn() }
		});

		const rpc = await callRpc(handler, 'tools/call', {
			name: 'who_am_i',
			arguments: {}
		});

		expect(rpc.result).toMatchObject({
			structuredContent: { userId: 'user-123', email: 'eric@example.com' },
			content: [
				{
					type: 'text',
					text: JSON.stringify({ userId: 'user-123', email: 'eric@example.com' })
				}
			]
		});
	});

	it('creates a note through the user-scoped notes store', async () => {
		const note = {
			id: 'note-1',
			user_id: 'user-123',
			content: 'Authenticated MCP works',
			created_at: '2026-08-27T09:00:00.000Z'
		};
		const create = vi.fn().mockResolvedValue(note);
		const handler = createNotesMcpHandler({
			identity: { userId: 'user-123', email: 'eric@example.com' },
			notes: { create, list: vi.fn() }
		});

		const rpc = await callRpc(handler, 'tools/call', {
			name: 'create_note',
			arguments: { content: 'Authenticated MCP works' }
		});

		expect(create).toHaveBeenCalledWith('Authenticated MCP works');
		expect(rpc.result.structuredContent).toEqual({ note });
	});

	it('rejects blank note content before calling the notes store', async () => {
		const create = vi.fn();
		const handler = createNotesMcpHandler({
			identity: { userId: 'user-123', email: 'eric@example.com' },
			notes: { create, list: vi.fn() }
		});

		const rpc = await callRpc(handler, 'tools/call', {
			name: 'create_note',
			arguments: { content: '   ' }
		});

		expect(create).not.toHaveBeenCalled();
		expect(rpc.result.isError).toBe(true);
	});

	it('lists notes through the user-scoped notes store', async () => {
		const notes = [
			{
				id: 'note-1',
				user_id: 'user-123',
				content: 'Only Eric can see this',
				created_at: '2026-08-27T09:00:00.000Z'
			}
		];
		const list = vi.fn().mockResolvedValue(notes);
		const handler = createNotesMcpHandler({
			identity: { userId: 'user-123', email: 'eric@example.com' },
			notes: { create: vi.fn(), list }
		});

		const rpc = await callRpc(handler, 'tools/call', {
			name: 'list_notes',
			arguments: {}
		});

		expect(list).toHaveBeenCalledOnce();
		expect(rpc.result.structuredContent).toEqual({ notes });
	});
});
