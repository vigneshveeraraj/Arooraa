# Admin account recovery runbook

There is no self-service "forgot password" flow in the admin UI, by design (Milestone
2C/2D scope explicitly excludes it). All account recovery below is an operational
procedure that requires the same access an operator already needs to deploy or restart
the backend (SSH to the VPS, or an equivalent local/CI mechanism). This keeps the
attack surface small: nothing about account recovery is reachable over HTTP.

Every password below is set via environment variable and hashed by the application's own
`PasswordEncoder` (BCrypt) before it ever touches the database. **Never** hand-write a
BCrypt hash and `INSERT`/`UPDATE` it directly via `psql` — that is exactly the failure
mode this runbook exists to avoid (a mistyped hash, a hash generated with the wrong cost
factor, or a copy-pasted example hash from documentation silently becoming a real
credential).

Do not put any real email or password into this file, into git, into a commit message,
or into a chat/ticket system. Treat the values only as environment variables set directly
on the host at the moment they're needed.

## 1. Initial bootstrap (first admin, first deploy only)

On first startup, if `admin_users` is empty, `AdminBootstrapRunner` creates exactly one
admin from environment variables:

| Variable | Required | Notes |
|---|---|---|
| `AROORAA_ADMIN_BOOTSTRAP_EMAIL` | yes | becomes the login email, lowercased |
| `AROORAA_ADMIN_BOOTSTRAP_PASSWORD` | yes | ≥ 8 characters or bootstrap refuses to run |
| `AROORAA_ADMIN_BOOTSTRAP_NAME` | no | display name only, defaults to `Admin` |

**Bootstrap behaviour after an admin already exists:** it is a no-op. `AdminBootstrapRunner`
checks `admin_users` row count on every startup and does nothing at all once that count is
above zero — it never overwrites an existing admin, and leaving the bootstrap variables set
in the environment indefinitely is harmless (they're simply ignored after the first run).
That said, once the first admin exists, remove `AROORAA_ADMIN_BOOTSTRAP_PASSWORD` from the
environment/secret store — there's no further use for it, and there's no reason for the
plaintext value to keep existing anywhere after the one moment it was needed.

## 2. Resetting a lost admin password, or adding another admin

Use when: the only admin has forgotten their password, or you need to add a second admin
and there is currently no in-app way to do that (no admin-management UI exists yet — this
is a documented, deliberate limitation, not an oversight).

**Before doing this in production: take a database backup first** (see the backup
procedure in the deployment runbook / Step 21 of the Milestone 2D report). This is a
direct write to `admin_users`; a backup costs one `pg_dump` and means a mistake is
trivially reversible.

Steps:

1. SSH to the host running the backend.
2. Set exactly these three variables in the shell/environment used to start the app:
   - `AROORAA_ADMIN_RESET_EMAIL` — the email to reset (existing) or create (new)
   - `AROORAA_ADMIN_RESET_PASSWORD` — the new password, ≥ 8 characters
   - `AROORAA_ADMIN_RESET_NAME` — optional, display name, only used if creating a new admin
3. Start (or restart) the application with the `admin-maintenance` Spring profile active,
   e.g. `SPRING_PROFILES_ACTIVE=admin-maintenance`, alongside the normal production
   variables. This activates `AdminAccountMaintenanceRunner`, which is otherwise
   completely inert and does not run during ordinary operation.
4. On startup, the runner:
   - looks up `AROORAA_ADMIN_RESET_EMAIL`;
   - if that admin **exists**, re-hashes and overwrites their `password_hash` only —
     nothing else about the account changes, and an inactive account stays inactive
     (the runner logs a warning rather than silently reactivating it, so a reset can't
     be used to accidentally undo a deliberate deactivation);
   - if that admin **does not exist**, creates a new active admin with that email/password
     and the given display name — this is the supported way to add a second admin.
   - The password is never written to any log; only the email and the fact that a
     reset/create happened are logged.
5. Confirm success in the application log (`admin-maintenance: password reset for
   existing admin email=...` or `admin-maintenance: created new admin email=...`).
6. **Restart the application again without `SPRING_PROFILES_ACTIVE=admin-maintenance` and
   without the `AROORAA_ADMIN_RESET_*` variables.** This is required, not optional: left
   active, every subsequent restart would re-run the same reset. Removing the variables
   from the secret store afterward also means the plaintext password doesn't linger
   anywhere longer than it has to.
7. Log in as normal to confirm the new credential works.

## 3. Deactivating a compromised or departing admin's account

There is no admin-management UI for this yet (out of scope for 2C/2D — see the "no
employee management" exclusion in the Milestone 2C spec). Deactivation is a direct,
minimal SQL update — safe because, unlike a password, `active` is a plain boolean with no
way to get "wrong" in a security-relevant sense:

```sql
UPDATE admin_users SET active = false, updated_at = now() WHERE email = 'the-admin-email';
```

An inactive admin is rejected at login (`AdminUserDetailsService`/`AdminPrincipal.isEnabled()`
returns `active`), even with the correct password, and any of their existing sessions stop
passing authentication on their next request once Spring re-validates account status. To
reactivate later, run the same statement with `active = true`, or use the reset/create
procedure in section 2 to also rotate their password at the same time.

## 4. Why this mechanism and not something else

- No forgot-password UI: adding one is real scope (email delivery, token generation,
  expiry, rate limiting, its own attack surface) that this milestone explicitly excludes.
- No manual hash insertion: asking an operator to hand-produce a BCrypt hash (with the
  correct cost factor, correctly escaped for SQL, from a tool that's actually available on
  the VPS) is exactly the kind of manual, error-prone, one-off process this runbook is
  meant to replace. `AdminAccountMaintenanceRunner` reuses the exact same `PasswordEncoder`
  bean the application already uses for login, so the hash is always correct by
  construction.
- Profile-gated, not a new HTTP endpoint: requiring server access (not a URL) to invoke
  recovery means there is nothing new here for an outside attacker to probe, brute-force,
  or enumerate — the existing SSH/deploy access boundary is the only new boundary this
  adds.
