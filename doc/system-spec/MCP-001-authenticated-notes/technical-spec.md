# Technical Specification: Authenticated MCP Notes

> **Work Item ID**: MCP-001
> **Project Task**: `doc/project-tasks/MCP-001-authenticated-notes-project-task.md`
> **Status**: Approved for implementation
> **Last updated**: 2026-08-28

## 1. Deployment Architecture

```text
ChatGPT                                  Browser
   | MCP Streamable HTTP + OAuth            | Supabase email/password
   +---------------------+-------------------+
                         |
                         v
              SvelteKit `apps/web` on Vercel
                 | `/mcp`
                 | OAuth metadata/challenges
                 | Auth/consent/notes UI
                         |
                         v
               Supabase Auth + PostgreSQL
                 | OAuth 2.1 Server (beta)
                 | JWT/JWKS/DCR/PKCE
                 | `notes` + RLS
```

Only `apps/web` is deployed for this MVP. The existing NestJS API and its PostgreSQL/MinIO dependencies remain unchanged and are not runtime dependencies of the demo.

The canonical MVP-owned layout is:

```text
apps/web/
├── src/                         SvelteKit UI, OAuth, notes, and MCP routes
├── supabase/
│   └── migrations/              Supabase notes table and RLS history
└── vercel.json                  Web deployment configuration
```

`apps/web/supabase/migrations` is an explicit boundary for this independently
deployed Supabase demo. It does not modify or replace the template backend's
canonical Drizzle history in `apps/migrator/drizzle`.

## 2. Route Contract

| Route                                       | Method     | Purpose                                                     |
| ------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `/`                                         | GET        | Demo landing page                                           |
| `/mcp-auth/login`                           | GET        | Supabase email/password login                               |
| `/mcp-auth/signup`                          | GET        | Supabase email/password signup                              |
| `/oauth/consent`                            | GET        | OAuth client/scopes approval UI                             |
| `/notes`                                    | GET        | Authenticated user notes UI                                 |
| `/.well-known/oauth-protected-resource`     | GET        | RFC 9728 resource metadata                                  |
| `/.well-known/oauth-protected-resource/mcp` | GET        | Path-aware metadata alias                                   |
| `/mcp`                                      | POST       | MCP Streamable HTTP endpoint                                |
| `/mcp`                                      | GET/DELETE | Explicit method handling required by the selected transport |

## 3. Environment Contract

The web application uses:

```text
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY
PUBLIC_APP_URL
```

No Supabase `service_role` or secret key is used to read or write user notes. The publishable key is combined with the authenticated user's bearer token so PostgreSQL evaluates RLS as that user.

## 4. OAuth Contract

### Resource server

- Canonical resource: `PUBLIC_APP_URL`.
- Protected-resource metadata advertises the Supabase Auth issuer (`${PUBLIC_SUPABASE_URL}/auth/v1`).
- Every protected MCP tool declares OAuth security schemes.
- Authentication failures include both HTTP `WWW-Authenticate` and MCP `_meta["mcp/www_authenticate"]` where applicable.

### Authorization server

Supabase OAuth 2.1 Server provides authorization code + PKCE, discovery, DCR, tokens, refresh, user info, and JWKS. The project owner enables it in the dashboard and sets the authorization path to `/oauth/consent`.

### Token verification

The MCP server treats bearer tokens as untrusted and verifies:

- JWT signature against Supabase JWKS.
- Exact issuer.
- `exp`/`nbf` validity.
- Audience/resource binding to `PUBLIC_APP_URL` (or the approved fixed audience configuration).
- Authenticated role and stable `sub` user ID.

The resolved identity is attached to the request/tool context. Tool handlers do not accept a caller-supplied `user_id`.

## 5. Database

```sql
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);
```

RLS is enabled and forced. Policies require `auth.uid() = user_id` for select and insert. The insert path also verifies the new row's owner through `WITH CHECK`.

Indexes:

- `(user_id, created_at desc)` for user-scoped listing.

## 6. Supabase Access

### Browser

The browser Supabase client uses the publishable key. Supabase manages the local user session. All note operations are executed with that session and are constrained by RLS.

### MCP server

For each MCP request, the server creates a Supabase client with the publishable key and the verified incoming bearer token in the `Authorization` header. Inserts set `user_id` from the verified token subject. Selects still include a defensive `user_id = subject` filter in addition to RLS.

## 7. MCP Tool Schemas and Annotations

- `who_am_i`: read-only, non-destructive, closed-world.
- `list_notes`: read-only, non-destructive, closed-world.
- `create_note`: write action, non-destructive, closed-world.

All tools require OAuth. `create_note.content` is trimmed and must remain non-empty.

Tool results include both model-readable text content and stable structured content.

## 8. Testing Strategy

Tests use public seams and follow RED/GREEN/REFACTOR:

- Pure unit tests for bearer parsing, JWT verification boundaries, OAuth metadata, challenges, and note validation.
- Repository tests with a fake Supabase query boundary to prove subject-derived ownership and filtering.
- MCP route tests for initialize, tools/list, authenticated calls, and authentication errors.
- Svelte checks/build for UI and route integration.
- Manual live verification with MCP Inspector, ChatGPT Developer Mode, and two real Supabase users.

## 9. Operational Verification

Before live acceptance:

1. Verify both Supabase discovery documents and JWKS are public.
2. Verify the MCP protected-resource metadata points to the exact issuer.
3. Complete DCR and PKCE through ChatGPT.
4. Decode a test access token and confirm issuer, subject, expiry, and audience.
5. Run User A/User B create/list tests from both ChatGPT and the web.

## 10. Rollback

- Revert the Vercel deployment to the previous production deployment.
- Disable Supabase OAuth 2.1 Server and public signup.
- Revoke/delete dynamically registered OAuth clients and user grants if necessary.
- Apply a forward migration that removes the isolated `notes` table only after confirming no demo data must be retained.
- Existing NestJS auth/CMS functionality is unaffected because this Work Item does not modify those backends.
