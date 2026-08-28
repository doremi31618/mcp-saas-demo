# Authenticated MCP Notes Project Task

> **Work Item ID**: MCP-001
> **Status**: Ready for review — migration layout correction
> **Actor**: Codex
> **Role**: Owner
> **Branch**: `feat/MCP-001-web-supabase-layout`
> **Base**: `dev` (`origin/dev` at `fa2dc7b`)
> **Worktree**: `/Users/ericzhan/Documents/side-projects/mcp-saas-demo-worktrees/MCP-001-web-supabase-layout`
> **PR**: Original implementation merged in PR #1; layout correction [PR #2](https://github.com/doremi31618/mcp-saas-demo/pull/2)
> **Related Spec**: `doc/system-spec/MCP-001-authenticated-notes/product-spec.md`, `doc/system-spec/MCP-001-authenticated-notes/technical-spec.md`
> **Release**: Pending
> **Last updated**: 2026-08-28

## Objective

Prove the authenticated SaaS path from ChatGPT through OAuth 2.1 and an MCP server to user-isolated Supabase data, while exposing the same notes to the signed-in user in the SvelteKit web application.

## Discovery / Shared Understanding

- **Mode**: Grill Me enabled
- **Gate status**: Approved
- **Approved at**: 2026-08-27
- **Summary**: Build a private Developer Mode demo in the existing SvelteKit monorepo. ChatGPT and the web app authenticate against a dedicated Supabase Auth tenant and read/write the same RLS-protected notes.
- **Key decisions**:
  - Keep the existing NestJS email/password and Google OAuth implementation unchanged.
  - Use a separate Supabase identity system for this MVP.
  - Allow email/password self-registration without email confirmation.
  - Use an explicit OAuth consent screen and Dynamic Client Registration.
  - Deploy only `apps/web` to a fixed Vercel Production URL.
  - Keep public OpenAI plugin submission and review out of scope.
  - Reuse existing UI primitives, not the CMS schema, API, editor, or authorization model.
- **Assumptions**:
  - Supabase's hosted OAuth 2.1 Server beta supports ChatGPT discovery, DCR, PKCE, refresh, and the MCP `resource` parameter for the selected project.
  - The production Vercel URL will be `https://mcp-saas-demo.vercel.app` unless Vercel assigns a different available project URL.
- **Risks and acceptance**:
  - Public signup without email verification can be abused. This is accepted for the short-lived private demo and is mitigated by Supabase default rate limits and a post-demo recommendation to close signup or enable verification.
  - Supabase OAuth 2.1 Server is beta. Verify discovery, token audience, and ChatGPT linking before declaring the live flow complete; if audience binding is unavailable, use a fixed MCP audience hook or reopen the identity-provider decision.
  - The original copied worktree shared Git metadata with the template. It was preserved as a recoverable backup, and this project now uses an independent repository and feature worktree.

## Acceptance Criteria

- [ ] Users can self-register, sign in, and sign out with Supabase email/password on the web.
- [ ] Signed-in users can create and list their own plain-text notes on the web.
- [ ] The remote MCP server exposes `who_am_i`, `create_note`, and `list_notes` over Streamable HTTP at `/mcp`.
- [ ] ChatGPT discovers OAuth metadata, completes OAuth 2.1 login/consent, and calls all three tools in Developer Mode.
- [ ] A note created through ChatGPT appears on the web for the same user, and a web-created note appears through `list_notes`.
- [x] Missing, invalid, expired, wrong-issuer, or wrong-audience access tokens cannot invoke protected tools.
- [ ] PostgreSQL RLS prevents User A from reading or writing User B's notes and vice versa.
- [x] Focused tests, repository type checks, lint, and the production web build pass.
- [x] The repository contains exact Supabase, Vercel, and ChatGPT setup/verification instructions.

## Scope

### In scope

- SvelteKit Supabase login, signup, consent, and notes routes.
- Supabase browser/server helpers that never use a service-role key for user note access.
- Supabase notes migration with RLS policies.
- OAuth protected-resource metadata and standards-compliant authentication challenges.
- MCP tools, schemas, annotations, token verification, and user-scoped note access.
- A focused MCP demo home page.
- Vercel adapter/configuration and production setup documentation.
- Automated unit/route contract tests and manual two-user verification instructions.

### Out of scope

- Public OpenAI plugin submission, marketplace review, identity verification, policy pages, and listing assets.
- Deploying the NestJS API, Drizzle PostgreSQL, MinIO, CMS backend, or existing Google OAuth flow.
- Note editing, deletion, rich text, tags, search, pagination, billing, organizations, RBAC, or analytics.
- Custom domain, staging environment, CAPTCHA, and email verification.

## Required Tests

- [x] Unit: bearer extraction and JWT verification failures/success.
- [x] Unit: protected-resource metadata and authentication challenge generation.
- [x] Unit: note input validation and user-scoped repository behavior.
- [x] Integration: MCP initialize/list-tools/call-tool request contracts.
- [ ] Integration: web auth/notes route guards and Supabase error states where practical.
- [ ] SQL/manual: RLS isolation with two Supabase users.
- [x] Repository lint, typecheck, focused tests, and production build.

## Tasks

- [x] Discovery and shared understanding
- [x] Independent repository and feature worktree
- [x] Product and technical specifications
- [x] Test-first implementation
- [x] Supabase migration and configuration guide
- [x] Keep the MCP demo's Supabase migration under `apps/web/supabase/migrations`
- [x] SvelteKit auth/consent/notes UI
- [x] OAuth metadata and MCP server
- [x] Validation and security review
- [x] Original implementation PR and reviewer handoff
- [x] Original implementation integrated into `dev`
- [x] Migration layout correction PR and reviewer handoff
- [ ] Release note

## Decisions and Work Log

- 2026-08-27: Approved a dedicated Supabase identity/data path for MCP while retaining the template's existing auth code unchanged.
- 2026-08-27: Limited OpenAI integration to private ChatGPT Developer Mode testing.
- 2026-08-27: Chose a fixed Vercel production URL and one production Supabase project with default deployment settings.
- 2026-08-27: Preserved the copied template folder and created an independent repository at `git@github.com:doremi31618/mcp-saas-demo.git`.
- 2026-08-27: Completed 13 focused tests, Svelte type checking, lint, Vercel production build, OAuth HTTP smoke checks, and browser verification of the home/login routes.
- 2026-08-28: Moved the MCP demo migration from the repository root to `apps/web/supabase/migrations` so the migration is owned by the only deployed MVP app. The SQL behavior is unchanged.
- 2026-08-28: Grill Me and TDD were skipped with explicit owner approval because this correction only changes file ownership and documentation, not runtime behavior.

## Handoff

- **Commit/PR**: Original implementation merged in PR #1; layout correction commit `bf6ac08` in [PR #2](https://github.com/doremi31618/mcp-saas-demo/pull/2)
- **Branch/Worktree**: `feat/MCP-001-web-supabase-layout` at `/Users/ericzhan/Documents/side-projects/mcp-saas-demo-worktrees/MCP-001-web-supabase-layout`
- **Validation**: Migration SQL SHA-256 is unchanged; 13/13 focused tests, workspace package build, Svelte check (0 errors), and Vercel production build pass. Live OAuth and two-user RLS validation remain pending.
- **Known issues**: Live Supabase/Vercel/ChatGPT configuration requires the project owner's authenticated dashboard access. Existing template CMS/editor files still emit non-blocking lint and Svelte accessibility warnings.
- **Next action**: Review and merge the migration layout correction into `dev`, then apply the documented Supabase/Vercel settings, run the two-user test, and connect the deployed `/mcp` endpoint in ChatGPT.
