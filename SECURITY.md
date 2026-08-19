# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue.
2. Email security details to: `security@devbeacon.dev` (or open a private security advisory on GitHub).
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to acknowledge reports within **24 hours** and provide a fix or mitigation within **7 days**.

## What We Protect Against

### SSRF (Server-Side Request Forgery)

Portfolio URLs submitted by users are validated against SSRF attacks:

- **Internal IP blocking** — requests to `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, and `::1` are rejected.
- **Protocol restriction** — only `http` and `https` protocols are allowed.
- **DNS rebinding protection** — resolved IPs are validated against the blocklist before connection.
- **Timeout enforcement** — all outbound requests have a 10-second timeout.

### Rate Limiting

- **Submission endpoint** (`POST /api/v1/submit`) is rate-limited to **5 requests per minute per IP**.
- **Search and listing endpoints** are rate-limited to **60 requests per minute per IP**.
- Rate limits use a sliding window and return `429 Too Many Requests` when exceeded.

### Additional Protections

- **Input validation** — all user input is validated with Zod schemas before processing.
- **SQL injection prevention** — Prisma ORM parameterizes all queries.
- **XSS prevention** — React escapes output by default; user-supplied HTML is sanitized.
- **CSRF protection** — Next.js built-in CSRF tokens for form submissions.

## Scope

This security policy applies to the codebase in this repository. Third-party services and dependencies are outside our direct control, though we monitor advisories via `npm audit`.
