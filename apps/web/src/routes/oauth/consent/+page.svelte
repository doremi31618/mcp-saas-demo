<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Badge } from '@platform/ui/badge';
	import { Button } from '@platform/ui/button';
	import * as Card from '@platform/ui/card';
	import type { OAuthAuthorizationDetails } from '@supabase/supabase-js';
	import { Bot, Check, LoaderCircle, ShieldCheck, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import DemoNav from '$lib/components/demo-nav.svelte';
	import { getSupabaseBrowserClient } from '$lib/supabase/client';

	let details = $state<OAuthAuthorizationDetails | null>(null);
	let loading = $state(true);
	let decision = $state<'approve' | 'deny' | null>(null);
	let errorMessage = $state('');

	onMount(async () => {
		const authorizationId = page.url.searchParams.get('authorization_id');
		if (!authorizationId) {
			errorMessage = 'Missing authorization_id.';
			loading = false;
			return;
		}

		const supabase = getSupabaseBrowserClient();
		const { data: sessionData } = await supabase.auth.getSession();
		if (!sessionData.session) {
			const redirect = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
			await goto(`/mcp-auth/login?redirect=${encodeURIComponent(redirect)}`);
			return;
		}

		const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
		if (error || !data) {
			errorMessage = error?.message ?? 'This authorization request is invalid or expired.';
			loading = false;
			return;
		}

		if ('redirect_url' in data) {
			window.location.assign(data.redirect_url);
			return;
		}

		details = data;
		loading = false;
	});

	async function submitDecision(action: 'approve' | 'deny') {
		if (!details) return;
		decision = action;
		errorMessage = '';
		const oauth = getSupabaseBrowserClient().auth.oauth;
		const response =
			action === 'approve'
				? await oauth.approveAuthorization(details.authorization_id, { skipBrowserRedirect: true })
				: await oauth.denyAuthorization(details.authorization_id, { skipBrowserRedirect: true });

		if (response.error || !response.data) {
			errorMessage = response.error?.message ?? 'Could not complete authorization.';
			decision = null;
			return;
		}

		window.location.assign(response.data.redirect_url);
	}
</script>

<svelte:head><title>Authorize ChatGPT · Authenticated MCP</title></svelte:head>

<div class="min-h-screen bg-muted/30">
	<DemoNav />
	<main class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-xl place-items-center px-5 py-12">
		<Card.Root class="w-full overflow-hidden shadow-xl shadow-slate-900/5">
			<Card.Header class="border-b text-center">
				<div class="mx-auto mb-4 flex items-center justify-center gap-3">
					<span class="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white"
						><Bot aria-hidden="true" /></span
					>
					<span class="text-muted-foreground">→</span>
					<span
						class="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
						><ShieldCheck aria-hidden="true" /></span
					>
				</div>
				<Card.Title class="text-2xl">Authorize MCP access</Card.Title>
				<Card.Description
					>Review exactly what the requesting client can do with your account.</Card.Description
				>
			</Card.Header>
			<Card.Content class="pt-6">
				{#if loading}
					<div class="flex items-center justify-center gap-2 py-12 text-muted-foreground">
						<LoaderCircle class="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading
						request…
					</div>
				{:else if details}
					<div class="space-y-6">
						<div>
							<p class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
								Requesting application
							</p>
							<p class="mt-2 text-lg font-semibold">{details.client.name || 'ChatGPT'}</p>
							<p class="mt-1 text-sm break-all text-muted-foreground">{details.redirect_uri}</p>
						</div>
						<div>
							<p class="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
								Requested access
							</p>
							<ul class="space-y-2">
								{#each details.scope.split(' ').filter(Boolean) as scope (scope)}
									<li class="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm">
										<Check class="size-4 text-emerald-600" aria-hidden="true" />
										<Badge variant="outline" class="font-mono">{scope}</Badge>
									</li>
								{/each}
							</ul>
						</div>
						<p class="text-sm leading-6 text-muted-foreground">
							The client can call <code>who_am_i</code>, <code>create_note</code>, and
							<code>list_notes</code>. PostgreSQL RLS limits every note operation to your user ID.
						</p>
					</div>
				{/if}
				{#if errorMessage}<p role="alert" class="mt-4 text-sm text-destructive">
						{errorMessage}
					</p>{/if}
			</Card.Content>
			{#if details}
				<Card.Footer class="grid grid-cols-2 gap-3 border-t pt-6">
					<Button
						variant="outline"
						onclick={() => submitDecision('deny')}
						disabled={decision !== null}
					>
						{#if decision === 'deny'}<LoaderCircle
								class="animate-spin motion-reduce:animate-none"
								aria-hidden="true"
							/>{:else}<X aria-hidden="true" />{/if} Deny
					</Button>
					<Button onclick={() => submitDecision('approve')} disabled={decision !== null}>
						{#if decision === 'approve'}<LoaderCircle
								class="animate-spin motion-reduce:animate-none"
								aria-hidden="true"
							/>{:else}<Check aria-hidden="true" />{/if} Allow
					</Button>
				</Card.Footer>
			{/if}
		</Card.Root>
	</main>
</div>
