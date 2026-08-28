<script lang="ts">
	import { Button } from '@platform/ui/button';
	import { Braces, NotebookText } from 'lucide-svelte';
</script>

<header class="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
	<div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
		<a
			href="/"
			class="flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			<span
				class="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"
			>
				<Braces class="size-5" aria-hidden="true" />
			</span>
			<span class="text-sm font-semibold tracking-tight sm:text-base">Authenticated MCP</span>
		</a>

		<nav aria-label="Primary navigation" class="flex items-center gap-2">
			<Button href="/notes" variant="ghost" size="sm">
				<NotebookText aria-hidden="true" />
				<span class="hidden sm:inline">My notes</span>
			</Button>
			<Button href="/mcp-auth/login" size="sm">Sign in</Button>
		</nav>
	</div>
</header>
