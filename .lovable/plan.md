

# Add PulseAI Compliance Beta Card to Portal Hub

## What

Add a 4th card to the "/" portal page labeled "Pulse Command" with subtitle "PulseAI Beta", using an AI-themed icon (e.g., `Brain` from lucide-react). It links to `/pulse` which will show a placeholder page for now.

## Changes

### 1. `src/pages/AgentLogin.tsx`
- Add a 4th entry to the `PORTALS` array:
  ```
  key: "pulse", label: "Pulse Command", description: "PulseAI Compliance Beta",
  href: "/pulse", icon: Brain, accentHsl: "0 72% 51%" (red accent)
  ```
- The grid already uses `md:grid-cols-3` — we'll keep the top 3 cards on one row and the Pulse card below-left (matching the screenshot layout). Change to a layout that places the 4th card below.

### 2. `src/pages/pulse/PulseHome.tsx` (new)
- Simple placeholder page branded "PulseAI Compliance Beta" with a beta badge and back-to-portal link. Coming-soon cards for Agent Monitor, Dashboard, and Logic Manager.

### 3. `src/App.tsx`
- Add route: `/pulse` → `PulseHome`

This gets the card on the portal now. The full Pulse functionality will be built in subsequent steps.

