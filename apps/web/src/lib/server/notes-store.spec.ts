import { describe, expect, it, vi } from 'vitest';

import { createSupabaseNotesStore } from './notes-store';

describe('createSupabaseNotesStore', () => {
	it('derives user_id from the authenticated identity when inserting', async () => {
		const note = {
			id: 'note-1',
			user_id: 'user-123',
			content: 'Private note',
			created_at: '2026-08-27T09:00:00.000Z'
		};
		const single = vi.fn().mockResolvedValue({ data: note, error: null });
		const select = vi.fn().mockReturnValue({ single });
		const insert = vi.fn().mockReturnValue({ select });
		const from = vi.fn().mockReturnValue({ insert });
		const store = createSupabaseNotesStore({ from } as never, 'user-123');

		await expect(store.create('Private note')).resolves.toEqual(note);
		expect(from).toHaveBeenCalledWith('notes');
		expect(insert).toHaveBeenCalledWith({ user_id: 'user-123', content: 'Private note' });
	});

	it('filters listed notes by the authenticated user in addition to RLS', async () => {
		const notes = [
			{
				id: 'note-1',
				user_id: 'user-123',
				content: 'Private note',
				created_at: '2026-08-27T09:00:00.000Z'
			}
		];
		const order = vi.fn().mockResolvedValue({ data: notes, error: null });
		const eq = vi.fn().mockReturnValue({ order });
		const select = vi.fn().mockReturnValue({ eq });
		const from = vi.fn().mockReturnValue({ select });
		const store = createSupabaseNotesStore({ from } as never, 'user-123');

		await expect(store.list()).resolves.toEqual(notes);
		expect(eq).toHaveBeenCalledWith('user_id', 'user-123');
		expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
	});
});
