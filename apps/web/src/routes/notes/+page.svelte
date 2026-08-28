<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@platform/ui/button';
	import * as Card from '@platform/ui/card';
	import { Label } from '@platform/ui/label';
	import { Textarea } from '@platform/ui/textarea';
	import type { Session } from '@supabase/supabase-js';
	import { LoaderCircle, LogOut, NotebookPen, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import DemoNav from '$lib/components/demo-nav.svelte';
	import type { Note } from '$lib/server/mcp/server';
	import { getSupabaseBrowserClient } from '$lib/supabase/client';

	let session = $state<Session | null>(null);
	let notes = $state<Note[]>([]);
	let content = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let errorMessage = $state('');

	async function loadNotes(userId: string) {
		const { data, error } = await getSupabaseBrowserClient()
			.from('notes')
			.select('id,user_id,content,created_at')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		notes = (data ?? []) as Note[];
	}

	onMount(async () => {
		const { data } = await getSupabaseBrowserClient().auth.getSession();
		if (!data.session) {
			await goto('/mcp-auth/login?redirect=%2Fnotes');
			return;
		}

		session = data.session;
		try {
			await loadNotes(data.session.user.id);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not load notes.';
		} finally {
			loading = false;
		}
	});

	async function createNote(event: SubmitEvent) {
		event.preventDefault();
		const text = content.trim();
		if (!text || !session) return;

		saving = true;
		errorMessage = '';
		const { data, error } = await getSupabaseBrowserClient()
			.from('notes')
			.insert({ user_id: session.user.id, content: text })
			.select('id,user_id,content,created_at')
			.single();

		if (error) {
			errorMessage = error.message;
		} else {
			notes = [data as Note, ...notes];
			content = '';
		}
		saving = false;
	}

	async function signOut() {
		await getSupabaseBrowserClient().auth.signOut();
		await goto('/');
	}
</script>

<svelte:head><title>My notes · Authenticated MCP</title></svelte:head>

<div class="min-h-screen bg-muted/30">
	<DemoNav />
	<main class="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">Signed in as {session?.user.email ?? '…'}</p>
				<h1 class="mt-1 text-3xl font-semibold tracking-tight">My notes</h1>
				<p class="mt-2 text-muted-foreground">
					The same rows returned by ChatGPT’s <code>list_notes()</code>.
				</p>
			</div>
			<Button variant="outline" onclick={signOut} disabled={!session}>
				<LogOut aria-hidden="true" /> Sign out
			</Button>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-lg"
					><NotebookPen aria-hidden="true" /> Add a note</Card.Title
				>
				<Card.Description>RLS binds this row to your authenticated Supabase user.</Card.Description>
			</Card.Header>
			<Card.Content>
				<form class="space-y-3" onsubmit={createNote}>
					<Label for="note-content" class="sr-only">Note content</Label>
					<Textarea
						id="note-content"
						bind:value={content}
						maxlength={10000}
						rows={4}
						placeholder="Authenticated MCP works"
						required
					/>
					<div class="flex justify-end">
						<Button type="submit" disabled={saving || !content.trim()}>
							{#if saving}<LoaderCircle
									class="animate-spin motion-reduce:animate-none"
									aria-hidden="true"
								/>{:else}<Plus aria-hidden="true" />{/if}
							Create note
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<div aria-live="polite" class="mt-8">
			{#if errorMessage}
				<p role="alert" class="mb-4 text-sm text-destructive">{errorMessage}</p>
			{/if}
			{#if loading}
				<div class="flex items-center justify-center gap-2 py-16 text-muted-foreground">
					<LoaderCircle class="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading
					notes…
				</div>
			{:else if notes.length === 0}
				<div
					class="rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center"
				>
					<NotebookPen class="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
					<h2 class="mt-4 font-medium">No notes yet</h2>
					<p class="mt-1 text-sm text-muted-foreground">
						Create one here, or ask ChatGPT after connecting the MCP server.
					</p>
				</div>
			{:else}
				<ul class="grid gap-4 sm:grid-cols-2">
					{#each notes as note (note.id)}
						<li class="rounded-2xl border border-border bg-background p-5 shadow-sm">
							<p class="leading-7 break-words whitespace-pre-wrap">{note.content}</p>
							<time class="mt-5 block text-xs text-muted-foreground" datetime={note.created_at}
								>{new Date(note.created_at).toLocaleString()}</time
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</main>
</div>
