import type { SupabaseClient } from '@supabase/supabase-js';

import type { Note, NotesStore } from './mcp/server';

const noteColumns = 'id,user_id,content,created_at';

export function createSupabaseNotesStore(client: SupabaseClient, userId: string): NotesStore {
	return {
		async create(content) {
			const { data, error } = await client
				.from('notes')
				.insert({ user_id: userId, content })
				.select(noteColumns)
				.single();

			if (error) throw error;
			return data as Note;
		},

		async list() {
			const { data, error } = await client
				.from('notes')
				.select(noteColumns)
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return data as Note[];
		}
	};
}
