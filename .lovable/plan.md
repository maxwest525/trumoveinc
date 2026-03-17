

## Rework the `/` Portal Page

The current portal is a flat grid of role-based cards. You want it restructured into **three clear sections** that map to how employees actually work, with external tool launchers built in.

### New Layout: Three-Section Hub

```text
┌──────────────────────────────────────────────────┐
│  Logo  ·  Good morning, Name  ·  Sign out        │
├──────────────────────────────────────────────────┤
│                                                  │
│  ── AGENTS ──────────────────────────────────── │
│  [Convoso Dialer]  [RingCentral]  [Granot CRM]  │
│  [Pipeline]  [Customers]  [Messages]             │
│                                                  │
│  ── MANAGERS ────────────────────────────────── │
│  [Convoso Admin]  [RingCentral Admin]            │
│  [Granot Manager]  [PulseOS Compliance]          │
│  [Team Performance]  [Coaching]                  │
│                                                  │
│  ── ADMIN / OWNER ───────────────────────────── │
│  [Marketing Suite]  [Customer-Facing Sites]      │
│  [Compliance]  [Accounting]  [Lead Vendors]      │
│  [User Management]  [Integrations]               │
│                                                  │
│  ☐ Remember my choice                           │
└──────────────────────────────────────────────────┘
```

### Section Details

**1. Agents Section** (visible to: agent, manager, admin, owner)
- **Convoso** — external link launcher (URL TBD, opens new tab)
- **RingCentral** — external link launcher (URL TBD, opens new tab)
- **Granot CRM** — external link launcher (URL TBD, opens new tab)
- **Pipeline** → `/agent/pipeline`
- **Customers** → `/agent/customers`
- **Messages** → `/agent/messages`
- **Dialer** → `/agent/dialer`

**2. Managers Section** (visible to: manager, admin, owner)
- **Convoso Admin** — external link (admin panel URL)
- **RingCentral Admin** — external link (admin panel URL)
- **Granot Manager View** — external link
- **PulseOS Compliance** — external link
- **Team Dashboard** → `/manager/dashboard`
- **Coaching** → existing coaching route

**3. Admin / Owner Section** (visible to: admin, owner)
- **Marketing Suite** → `/marketing/dashboard`
- **Customer-Facing Sites** → `/customer-facing-sites`
- **Compliance** → `/compliance/dashboard`
- **Accounting** → `/accounting/dashboard`
- **Lead Vendors** → `/leads/dashboard`
- **User Management** → `/admin/users`
- **Integrations** → `/admin/integrations`
- **KPIs** → `/kpi`

### Technical Approach

1. **Rewrite `src/pages/AgentLogin.tsx`** — Replace the flat `ROLES` grid with three grouped sections, each with a heading and its own card grid. Role-based visibility filtering stays (sections hidden if user lacks the role).

2. **Card types** — Two kinds:
   - **Internal**: navigates within the app (existing behavior)
   - **External**: opens a new tab to Convoso, RingCentral, Granot, PulseOS (placeholder URLs with `window.open`)

3. **Keep existing**: Auth flow, greeting, sign out, remember-me, notification badge, animations.

### Things You May Have Missed

- **Agent Dashboard** (`/agent/dashboard`) — should this be a card in the Agents section?
- **E-Sign Hub** (`/agent/esign`) — include as an agent tool?
- **Bookings / Operations** (`/agent/operations`) — include?
- **Team Chat** (`/agent/team-chat`) — agents or managers or both?
- **Admin Dashboard** (`/admin/dashboard`) — include in Admin section?
- **Support Tickets** (`/admin/support-tickets`) — include?
- **Leads Performance** (`/leads/performance`) — include under Admin?
- **Profile Settings** (`/agent/profile`) — accessible from header or a card?

### Open Question

I need the external URLs (or placeholder domains) for:
- Convoso (agent + admin views)
- RingCentral (agent + admin views)
- Granot CRM (agent + manager/admin views)
- PulseOS

I can use placeholder URLs and you can update them later.

