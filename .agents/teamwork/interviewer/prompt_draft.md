Configure this repository to deploy on Vercel as a project with multiple services [OPEN: Purpose of the deployment: production or showcase?].

Integrity mode: [OPEN: Restrictions on the team's approach]

## Requirements

### R1. Multi-Service Vercel Configuration
Configure `vercel.json` in the repository root to deploy the repository as multiple services on Vercel:
- Define the services under the `services` key with their roots, framework/runtime, and build commands [OPEN: Which services to include: client and server, or container app as well?].
- Configure top-level rewrites ordered from most specific to least specific, directing public traffic to the appropriate services.
- Define bindings on calling services for internal service-to-service communication injecting target base URLs via environment variables.

### R2. Application Code Alignment
Update application code across services to align with routing and bindings:
- Replace hardcoded hostnames, localhost ports, and internal base URLs with the bound environment variables injected by Vercel.
- Reconcile route handlers and client-side request paths with public routing prefixes.

### R3. Configuration Confirmation
Produce the final `vercel.json` and confirm service names, public vs internal routing, and service bindings.

## Acceptance Criteria

### Vercel Services Configuration
- [ ] `vercel.json` defines all required services with valid root directories and settings according to Vercel services schema.
- [ ] Top-level rewrites route public endpoints to target services with catch-all routing ordered last.
- [ ] Internal service bindings specify `type: "service"`, `service`, `format: "url"`, and `env`.

### Code Integration
- [ ] Internal service calls read the base URL from the bound environment variable.
- [ ] Public routes match the path prefixes configured in rewrites.

### Verification
- [ ] [OPEN: How should the configuration and cross-service calls be verified?]
