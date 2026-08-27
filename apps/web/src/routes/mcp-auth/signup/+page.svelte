<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '@platform/ui/button';
	import * as Card from '@platform/ui/card';
	import { Input } from '@platform/ui/input';
	import { Label } from '@platform/ui/label';
	import { LoaderCircle, UserRoundPlus } from 'lucide-svelte';

	import { safeRedirectPath } from '$lib/auth/redirect';
	import DemoNav from '$lib/components/demo-nav.svelte';
	import { getSupabaseBrowserClient } from '$lib/supabase/client';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	async function signUp(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		errorMessage = '';
		const { data, error } = await getSupabaseBrowserClient().auth.signUp({ email, password });

		if (error || !data.session) {
			errorMessage =
				error?.message ??
				'Account created, but no session was returned. Confirm that email verification is disabled for this MVP.';
			loading = false;
			return;
		}

		await goto(safeRedirectPath(page.url.searchParams.get('redirect')));
	}
</script>

<svelte:head><title>Create account · Authenticated MCP</title></svelte:head>

<div class="min-h-screen bg-muted/30">
	<DemoNav />
	<main class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-lg place-items-center px-5 py-12">
		<Card.Root class="w-full shadow-lg shadow-slate-900/5">
			<Card.Header>
				<div class="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
					<UserRoundPlus aria-hidden="true" />
				</div>
				<Card.Title class="text-2xl">Create a demo account</Card.Title>
				<Card.Description
					>Open registration is enabled for the MVP. Your notes remain isolated by PostgreSQL RLS.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<form class="space-y-5" onsubmit={signUp}>
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
							autocomplete="new-password"
							minlength={6}
							bind:value={password}
							required
							aria-describedby="password-help"
							aria-invalid={Boolean(errorMessage)}
						/>
						<p id="password-help" class="text-xs text-muted-foreground">
							Use at least 6 characters for this private demo.
						</p>
					</div>
					{#if errorMessage}<p role="alert" class="text-sm text-destructive">{errorMessage}</p>{/if}
					<Button type="submit" class="w-full" disabled={loading}>
						{#if loading}<LoaderCircle
								class="animate-spin motion-reduce:animate-none"
								aria-hidden="true"
							/>{/if}
						Create account
					</Button>
				</form>
			</Card.Content>
			<Card.Footer class="justify-center text-sm text-muted-foreground">
				Already registered? <a
					class="ml-1 text-foreground underline underline-offset-4"
					href={`/mcp-auth/login?redirect=${encodeURIComponent(safeRedirectPath(page.url.searchParams.get('redirect')))}`}
					>Sign in</a
				>
			</Card.Footer>
		</Card.Root>
	</main>
</div>
