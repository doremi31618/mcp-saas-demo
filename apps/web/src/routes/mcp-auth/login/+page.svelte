<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '@platform/ui/button';
	import * as Card from '@platform/ui/card';
	import { Input } from '@platform/ui/input';
	import { Label } from '@platform/ui/label';
	import { LoaderCircle, LockKeyhole } from 'lucide-svelte';

	import { safeRedirectPath } from '$lib/auth/redirect';
	import DemoNav from '$lib/components/demo-nav.svelte';
	import { getSupabaseBrowserClient } from '$lib/supabase/client';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	async function signIn(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		errorMessage = '';

		const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
		if (error) {
			errorMessage = error.message;
			loading = false;
			return;
		}

		await goto(safeRedirectPath(page.url.searchParams.get('redirect')));
	}
</script>

<svelte:head><title>Sign in · Authenticated MCP</title></svelte:head>

<div class="min-h-screen bg-muted/30">
	<DemoNav />
	<main class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-lg place-items-center px-5 py-12">
		<Card.Root class="w-full shadow-lg shadow-slate-900/5">
			<Card.Header>
				<div class="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
					<LockKeyhole aria-hidden="true" />
				</div>
				<Card.Title class="text-2xl">Sign in to your notes</Card.Title>
				<Card.Description
					>This same account is used when ChatGPT asks you to authorize the MCP connection.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<form class="space-y-5" onsubmit={signIn}>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							autocomplete="email"
							bind:value={email}
							required
							aria-invalid={Boolean(errorMessage)}
						/>
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							type="password"
							autocomplete="current-password"
							minlength={6}
							bind:value={password}
							required
							aria-invalid={Boolean(errorMessage)}
						/>
					</div>
					{#if errorMessage}<p role="alert" class="text-sm text-destructive">{errorMessage}</p>{/if}
					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}<LoaderCircle
								class="animate-spin motion-reduce:animate-none"
								aria-hidden="true"
							/>{/if}
						Sign in
					</Button>
				</form>
			</Card.Content>
			<Card.Footer class="justify-center text-sm text-muted-foreground">
				New here? <a
					class="ml-1 text-foreground underline underline-offset-4"
					href={`/mcp-auth/signup?redirect=${encodeURIComponent(safeRedirectPath(page.url.searchParams.get('redirect')))}`}
					>Create an account</a
				>
			</Card.Footer>
		</Card.Root>
	</main>
</div>
