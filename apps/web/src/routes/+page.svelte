<script lang="ts">
	import { Badge } from '@platform/ui/badge';
	import { Button } from '@platform/ui/button';
	import * as Card from '@platform/ui/card';
	import { ArrowRight, Bot, Check, Database, KeyRound, NotebookText } from 'lucide-svelte';

	import DemoNav from '$lib/components/demo-nav.svelte';

	const steps = [
		{ icon: Bot, label: 'ChatGPT', detail: 'calls an MCP tool' },
		{ icon: KeyRound, label: 'Supabase OAuth', detail: 'identifies the user' },
		{ icon: Database, label: 'Postgres + RLS', detail: 'isolates their notes' }
	];
</script>

<svelte:head>
	<title>Authenticated MCP Notes</title>
	<meta
		name="description"
		content="A focused demo of ChatGPT, Supabase OAuth, MCP tools, and row-level security."
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<a
		href="#main-content"
		class="sr-only z-50 rounded-md bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:ring-2 focus:ring-ring"
	>
		Skip to content
	</a>
	<DemoNav />

	<main id="main-content">
		<section class="relative isolate overflow-hidden">
			<div
				class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,oklch(0.9_0.07_250/.45),transparent_30%),radial-gradient(circle_at_85%_10%,oklch(0.92_0.08_80/.35),transparent_25%)]"
			></div>
			<div
				class="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center"
			>
				<div>
					<Badge variant="secondary" class="mb-6">Private MVP · 3 tools</Badge>
					<h1
						class="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-6xl"
					>
						Your notes, available to ChatGPT—without sharing anyone else’s.
					</h1>
					<p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
						Sign in with email and password, create notes on the web, then access the same private
						data through an authenticated MCP connection.
					</p>
					<div class="mt-8 flex flex-col gap-3 sm:flex-row">
						<Button href="/mcp-auth/signup" size="lg">
							Create demo account
							<ArrowRight aria-hidden="true" />
						</Button>
						<Button href="/notes" variant="outline" size="lg">Open my notes</Button>
					</div>
				</div>

				<Card.Root
					class="overflow-hidden border-border/70 bg-card/85 shadow-xl shadow-slate-900/5 backdrop-blur"
				>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<NotebookText class="size-5" aria-hidden="true" />
							MCP tool surface
						</Card.Title>
						<Card.Description>Exactly what this MVP exposes.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-3 pt-6 font-mono text-sm">
						{#each ['who_am_i()', 'create_note(content)', 'list_notes()'] as tool (tool)}
							<div class="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-3">
								<span
									class="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
								>
									<Check class="size-4" aria-hidden="true" />
								</span>
								{tool}
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<section class="border-y bg-slate-950 text-slate-50">
			<div class="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
				<p class="mb-8 text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
					One identity, one data boundary
				</p>
				<div class="grid gap-4 lg:grid-cols-3">
					{#each steps as step, index (step.label)}
						<div class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
							<div class="mb-8 flex items-center justify-between">
								<step.icon class="size-6" aria-hidden="true" />
								<span class="font-mono text-xs text-slate-500">0{index + 1}</span>
							</div>
							<h2 class="font-semibold">{step.label}</h2>
							<p class="mt-1 text-sm text-slate-400">{step.detail}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</main>
</div>
