

# Domain-Based Routing: Customer Site vs CRM

## Current State
- All routes live under one router. Customer-facing pages are at `/site/*`, CRM at `/` and `/agent/*`, `/admin/*`, etc.
- `hostDetection.ts` already has `isCrmDomain()` and `isMainDomain()` helpers but they're unused.
- Currently `trumoveinc.com` and `crm.trumoveinc.com` would show the same app.

## Goal
- **trumoveinc.com** (main domain) → customer-facing site at `/` (no `/site` prefix needed)
- **crm.trumoveinc.com** → CRM portal hub with auth gate at `/`
- **localhost / lovable.app** → show both (current behavior, or default to CRM)

## Plan

### 1. Update `hostDetection.ts`
- Make `isCrmDomain()` return `true` for `crm.trumoveinc.com`, `localhost`, and `*.lovable.app`
- Make `isMainDomain()` return `true` for `trumoveinc.com` (bare domain, no `crm.` prefix)

### 2. Create a `DomainRouter` wrapper component
A small component that checks the hostname and renders different route sets:

```text
if isMainDomain():
  /              → Index (customer homepage)
  /online-estimate → OnlineEstimate
  /book          → Book
  /about         → About
  /faq           → FAQ
  ... (all current /site/* routes, but without /site prefix)
  /portal        → CustomerPortal
  /portal/*      → CustomerPortalDashboard

if isCrmDomain():
  /              → AgentLogin (auth-gated)
  /login         → AgentLogin
  /agent/*       → CRM routes (auth-gated)
  /manager/*     → CRM routes
  /admin/*       → CRM routes
  /dispatch/*    → CRM routes
  /marketing/*   → CRM routes
```

### 3. Keep `/site/*` routes as fallback aliases
So existing bookmarks and internal links still work on either domain.

### 4. Auth enforcement on CRM domain
Already handled -- `AgentLogin` checks for a session and shows `PortalAuthForm` if none exists. CRM sub-routes (agent/dashboard, etc.) should also have auth guards. We'll add a simple `RequireAuth` wrapper that redirects to `/login` if no session.

### 5. Update internal links
- Customer-facing site links (Header, Footer, nav) should use relative paths (`/about` instead of `/site/about`) when on the main domain
- CRM internal links remain unchanged

### Technical Details

**Files to modify:**
- `src/lib/hostDetection.ts` -- activate domain detection logic
- `src/App.tsx` -- replace flat route list with `DomainRouter` that conditionally renders routes based on hostname
- `src/components/layout/Header.tsx` / `Footer.tsx` -- make link paths domain-aware (drop `/site` prefix on main domain)
- Create `src/components/auth/RequireAuth.tsx` -- session check wrapper for CRM routes

**Files unchanged:** All page components stay the same. No backend changes needed.

