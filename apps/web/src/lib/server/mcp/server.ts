import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

export type Note = {
	id: string;
	user_id: string;
	content: string;
	created_at: string;
};

export type NotesStore = {
	create(content: string): Promise<Note>;
	list(): Promise<Note[]>;
};

type NotesMcpContext = {
	identity: { userId: string; email: string };
	notes: NotesStore;
};

const readOnlyAnnotations = {
	readOnlyHint: true,
	destructiveHint: false,
	openWorldHint: false
};

const writeAnnotations = {
	readOnlyHint: false,
	destructiveHint: false,
	openWorldHint: false
};

const noteSchema = z.object({
	id: z.string(),
	user_id: z.string(),
	content: z.string(),
	created_at: z.string()
});

export function createNotesMcpHandler(context: NotesMcpContext) {
	return createMcpHandler(() => {
		const server = new McpServer({ name: 'mcp-saas-demo', version: '0.1.0' });

		server.registerTool(
			'who_am_i',
			{
				title: 'Who am I',
				description: 'Return the currently authenticated user identity.',
				inputSchema: z.object({}),
				outputSchema: z.object({ userId: z.string(), email: z.string().email() }),
				annotations: readOnlyAnnotations
			},
			async () => {
				const output = context.identity;
				return {
					content: [{ type: 'text', text: JSON.stringify(output) }],
					structuredContent: output
				};
			}
		);

		server.registerTool(
			'create_note',
			{
				title: 'Create note',
				description: 'Create a note owned by the currently authenticated user.',
				inputSchema: z.object({ content: z.string().trim().min(1).max(10_000) }),
				outputSchema: z.object({ note: noteSchema }),
				annotations: writeAnnotations
			},
			async ({ content }) => {
				const output = { note: await context.notes.create(content) };
				return {
					content: [{ type: 'text', text: JSON.stringify(output) }],
					structuredContent: output
				};
			}
		);

		server.registerTool(
			'list_notes',
			{
				title: 'List notes',
				description: 'List notes owned by the currently authenticated user.',
				inputSchema: z.object({}),
				outputSchema: z.object({ notes: z.array(noteSchema) }),
				annotations: readOnlyAnnotations
			},
			async () => {
				const output = { notes: await context.notes.list() };
				return {
					content: [{ type: 'text', text: JSON.stringify(output) }],
					structuredContent: output
				};
			}
		);

		return server;
	});
}
