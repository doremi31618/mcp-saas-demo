# Authenticated MCP SaaS Demo

A focused SvelteKit MVP proving this path end to end:

```text
ChatGPT → Supabase OAuth 2.1 → SvelteKit MCP server → PostgreSQL RLS → user-owned notes
```

The demo exposes three MCP tools:

- `who_am_i()`
- `create_note(content)`
- `list_notes()`

It also includes email/password signup and login, an OAuth consent screen, and a web page for creating and reading the same private notes. The original NestJS auth, CMS, and other template capabilities remain in the repository but are not part of this deployment.

## Local development

Requirements: Bun 1.3+ and Node.js 22.12+.

```bash
bun install --frozen-lockfile
cp apps/web/.env.example apps/web/.env.local
bun run build:packages
bun run dev:web
```

Required web environment variables:

```text
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
PUBLIC_APP_URL=http://localhost:5173
```

Apply [the Supabase migration](apps/web/supabase/migrations/20260827000000_create_notes.sql) before testing notes.

## Verification

```bash
bun run --filter '@platform/web' test
bun run build:packages
bun run --filter '@platform/web' check
bun run --filter '@platform/web' build
```

## Deployment

Follow the exact dashboard checklist in [Authenticated MCP deployment setup](doc/onboarding/mcp-authenticated-notes-deployment.md).

Implementation decisions and acceptance criteria are documented in:

- [Project Task](doc/project-tasks/MCP-001-authenticated-notes-project-task.md)
- [Product specification](doc/system-spec/MCP-001-authenticated-notes/product-spec.md)
- [Technical specification](doc/system-spec/MCP-001-authenticated-notes/technical-spec.md)

## Repository structure

```text
apps/web/       SvelteKit web UI, OAuth consent, MCP endpoint, and its Supabase migration
packages/ui/    Existing reusable Svelte UI primitives
doc/            Task, product, technical, and deployment documentation
```
