# Authenticated MCP Notes: deployment setup

This checklist deploys only the SvelteKit app in `apps/web`. The NestJS API, Drizzle database, MinIO, and CMS are not deployed for this MVP.

Use one stable production URL throughout this document. The examples use:

```text
https://mcp-saas-demo.vercel.app
```

If Vercel assigns a different production domain, replace the example everywhere with the exact assigned domain. Do not use a preview deployment URL for ChatGPT OAuth.

## 1. Create and configure Supabase

Create a project named `mcp-saas-demo`, then record these values:

- Project URL: `https://<project-ref>.supabase.co`
- Publishable key: `sb_publishable_...`

The publishable key is intended for browser use. Do not add a service-role key or JWT secret to this app.

### Database and RLS

In **SQL Editor**, open and run the contents of:

```text
apps/web/supabase/migrations/20260827000000_create_notes.sql
```

This migration belongs to the independently deployed MCP web demo. Keep it under
`apps/web/supabase`; it does not replace or extend the template backend's Drizzle
migration history in `apps/migrator`.

Then verify in **Database → Tables → notes**:

- RLS is enabled.
- Only `SELECT` and `INSERT` policies exist for authenticated users.
- Both policies compare `auth.uid()` with `user_id`.

### Email/password auth

In **Authentication → Providers → Email**:

- Enable the Email provider.
- Enable new user signup.
- Disable email confirmation for this private MVP.

In **Authentication → URL Configuration**:

- Site URL: the stable Vercel production URL.
- Add `http://localhost:5173/**` only when local OAuth testing is needed.

### JWT signing key

In **Authentication → Signing Keys**, use an asymmetric signing key such as ES256 or RS256. The MCP server verifies tokens through Supabase's public JWKS endpoint, and the requested `openid` scope requires asymmetric signing.

### OAuth 2.1 server

In **Authentication → OAuth Server**:

- Enable OAuth 2.1 Server.
- Authorization Path: `/oauth/consent`.
- Enable Dynamic Client Registration for the private ChatGPT test.

No manually registered OAuth client and no custom access-token hook are required for this MVP. Supabase OAuth access tokens use the standard `authenticated` audience, which the MCP endpoint verifies.

Dynamic registration is intentionally accepted as an MVP risk. Keep the app private and review registered OAuth clients during testing.

## 2. Import the repository into Vercel

Import:

```text
git@github.com:doremi31618/mcp-saas-demo.git
```

Use these project settings:

| Setting                                     | Value                            |
| ------------------------------------------- | -------------------------------- |
| Project name                                | `mcp-saas-demo`                  |
| Framework preset                            | SvelteKit                        |
| Root Directory                              | `apps/web`                       |
| Include source files outside Root Directory | On                               |
| Install command                             | Default                          |
| Build command                               | Read from `apps/web/vercel.json` |
| Production branch                           | `main`                           |

The custom build command compiles workspace packages used by the web app, then builds only `@platform/web`. It does not deploy `apps/api`.

### Environment variables

In **Project Settings → Environment Variables**, add these to Production:

| Name                              | Value                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| `PUBLIC_SUPABASE_URL`             | Supabase Project URL                                         |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                                     |
| `PUBLIC_APP_URL`                  | Exact stable Vercel production URL, without a trailing slash |

These values are public application configuration, not secrets. Never substitute a Supabase service-role key.

Deploy `main`. After the first production deployment, confirm the actual domain and update both `PUBLIC_APP_URL` and the Supabase Site URL if necessary, then redeploy.

## 3. Verify the deployed server before ChatGPT

Open these URLs:

```text
https://<production-domain>/
https://<production-domain>/.well-known/oauth-protected-resource/mcp
https://<production-domain>/mcp-auth/signup
```

The metadata endpoint must return:

- `resource` ending in `/mcp`.
- `authorization_servers[0]` ending in `.supabase.co/auth/v1`.
- `scopes_supported` containing `openid` and `email`.

An unauthenticated POST to `/mcp` must return HTTP 401 and a `WWW-Authenticate` header containing the protected-resource metadata URL.

Create User A and User B through the web signup page. For each user, create one note and verify the other account cannot see it.

## 4. Add the private app in ChatGPT

Current full MCP write actions are available to eligible ChatGPT Business and Enterprise/Edu workspaces; plan and admin permissions can affect whether `create_note` is available. Pro developer mode may be limited to read/fetch behavior.

For an eligible workspace:

1. Enable developer mode in **Settings → Apps → Advanced Settings**, or start from **Workspace Settings → Apps → Create** if you are an admin/owner.
2. Create a custom app.
3. MCP endpoint: `https://<production-domain>/mcp`.
4. Select OAuth authentication when prompted.
5. Click **Scan Tools**.
6. Sign in on the demo's email/password page.
7. Review the consent screen and click **Allow**.
8. Confirm the scan finds exactly `who_am_i`, `create_note`, and `list_notes`.
9. Keep the app as a draft for the MVP; public submission and workspace publication are out of scope.

Test in a new chat:

```text
Who am I in Authenticated MCP?
Create a note saying “Authenticated MCP works”.
List my notes.
```

Then refresh the web `/notes` page and verify the ChatGPT-created note appears.

## 5. Definition of done

- Web signup, login, logout, note creation, and note listing work.
- OAuth redirects through `/oauth/consent` and returns to ChatGPT.
- ChatGPT discovers exactly three tools.
- `who_am_i` returns the authenticated Supabase user.
- ChatGPT-created notes appear on the web.
- User A and User B cannot read each other's rows.

## References

- [Supabase OAuth 2.1 Server](https://supabase.com/docs/guides/auth/oauth-server)
- [Supabase MCP authentication](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication)
- [Supabase OAuth token security and RLS](https://supabase.com/docs/guides/auth/oauth-server/token-security)
- [OpenAI: Developer mode and MCP apps in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
