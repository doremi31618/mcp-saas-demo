# Product Specification: Authenticated MCP Notes

> **Work Item ID**: MCP-001
> **Project Task**: `doc/project-tasks/MCP-001-authenticated-notes-project-task.md`
> **Status**: Approved for implementation
> **Last updated**: 2026-08-27

## 1. Product Goal

Demonstrate that the same authenticated user can create and read private notes from ChatGPT and from the web application without exposing another user's data.

The product proof is:

```text
AI -> Identity -> Tool -> Business action -> User-isolated data
```

## 2. Users and Primary Flows

### 2.1 Web signup and notes

1. A visitor opens the demo home page.
2. They create an account with email and password.
3. They are signed in and redirected to `/notes`.
4. They create a plain-text note or list their existing notes.
5. They can sign out, after which `/notes` is no longer accessible.

Email confirmation is disabled for the MVP.

### 2.2 ChatGPT account linking

1. The user connects the public `/mcp` endpoint in ChatGPT Developer Mode.
2. ChatGPT discovers that the tools require OAuth.
3. The user signs in with the same Supabase email/password account.
4. The user sees the requesting client and scopes and explicitly approves or denies access.
5. ChatGPT receives an access token and invokes authenticated MCP tools.

### 2.3 Cross-channel note proof

1. The user asks ChatGPT to create a note.
2. The note appears on `/notes` for the same signed-in user.
3. A note created on `/notes` appears in ChatGPT through `list_notes`.

### 2.4 Multi-user isolation proof

1. User A creates "A secret".
2. User B creates "B secret".
3. User A only sees "A secret" from both channels.
4. User B only sees "B secret" from both channels.

## 3. User Interface

### `/`

A focused demo landing page with a short explanation and links to sign up, sign in, and view notes. Existing template features remain in the repository but are not part of the primary demo navigation.

### `/mcp-auth/signup`

- Email and password fields.
- Submit/loading/error states.
- A link to sign in.
- Successful signup redirects to the preserved return path or `/notes`.

### `/mcp-auth/login`

- Email and password fields.
- Submit/loading/error states.
- A link to sign up.
- Successful login redirects to the preserved OAuth consent URL or `/notes`.

### `/oauth/consent`

- Requires a valid Supabase browser session.
- Shows the requesting client's name and requested scopes.
- Provides explicit Allow and Deny actions.
- Redirects to the URL returned by Supabase after either decision.

### `/notes`

- Requires a valid Supabase session.
- Shows the signed-in email.
- Provides a plain-text note input and Create action.
- Lists all notes for the current user, newest first.
- Provides refresh and sign-out actions.
- Handles loading, empty, and error states.

## 4. MCP Tools

### `who_am_i`

Returns the authenticated user's stable Supabase user ID and email.

### `create_note`

Accepts a non-empty plain-text `content` value, creates a note owned by the authenticated user, and returns the created note.

### `list_notes`

Returns the authenticated user's notes newest first. It never returns another user's rows.

## 5. Error Behavior

- Protected routes redirect unauthenticated browser users to the MCP login page while preserving the intended return path.
- Missing or invalid MCP credentials return a standards-compliant OAuth challenge.
- Invalid note content produces a model-readable validation error and does not write data.
- Supabase/network failures produce actionable, non-secret error messages.
- Denying consent returns control to the OAuth client without granting access.

## 6. Acceptance Criteria

The acceptance criteria are maintained in `doc/project-tasks/MCP-001-authenticated-notes-project-task.md` and are authoritative for this Work Item.
