

## Plan: Portal Page Enhancements

Three changes to `/agent-login`:

### 1. Time-of-day greeting
Replace the static "Portal" heading with a dynamic greeting based on the hour:
- Before 12pm: "Good morning"
- 12pm-5pm: "Good afternoon"  
- After 5pm: "Good evening"

Display as: "Good morning, {first name or email prefix}" with "Portal" as a smaller subtitle.

### 2. Flat emoji-style icons instead of gradient icon boxes
Remove the gradient `bg-gradient-to-br` icon containers. Instead, use **emoji characters** rendered as the card's visual identity — large, flat, no background box. This gives a modern, playful, picture-like feel without gradients.

Mapping:
- Admin → 🛠️
- Agent → 🚚  
- Manager → 📊
- Marketing → 📣
- Accounting → 💰
- Lead Vendors → 📦
- Compliance → 🛡️
- Customer Sites → 🌐

Remove the `gradient`, `iconColor`, `shadowColor` fields from `RoleConfig`. Add an `emoji: string` field instead. The `WorkspaceCard` renders the emoji at ~28-32px font size, no icon background div needed.

### 3. Live stats badges on each card
Fetch counts from the database on mount and display a small badge on relevant cards:

| Card | Query | Badge label |
|------|-------|-------------|
| Admin | `profiles` count | "X users" |
| Agent | `leads` where status = 'new' | "X new leads" |
| Manager | `deals` count | "X deals" |
| Marketing | — | skip |
| Accounting | — | skip |
| Lead Vendors | `lead_vendors` where status = 'active' | "X vendors" |
| Compliance | — | skip |

Implementation:
- Create a `usePortalStats()` hook that runs parallel queries on mount
- Return a `Record<string, string>` mapping role id to badge text
- Render as a small muted pill/badge in the top-right of the card (e.g., `text-[10px] bg-muted rounded-full px-2 py-0.5`)
- Show skeleton dots while loading

### Files changed
- `src/pages/AgentLogin.tsx` — all three changes
- New: `src/hooks/usePortalStats.ts` — stats fetching hook

