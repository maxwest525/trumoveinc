
# Better Display of AI Scan & Manual Options in Estimator Nav Bar

## What Changes
Replace the trust indicator badges in the center of the AI Move Estimator's sticky header bar with two clear, interactive navigation tabs/buttons that let users switch between **AI Room Scanner** (`/scan-room`) and **Manual Builder** (`/online-estimate`).

## How It Will Look
The sticky dark header bar currently shows: Logo | Trust Badges (AI-Powered, Instant Estimates, etc.) | Estimate ID

It will become: Logo | **[AI Scan] [Manual Builder]** toggle buttons | Estimate ID

- The active page gets a highlighted/accent style (filled button with glow)
- The inactive option is a ghost/outline style
- Each button includes an icon (Scan for AI, Package for Manual)
- On mobile, the buttons shrink to icon-only with tooltips

## Technical Details

### File: `src/pages/OnlineEstimate.tsx`
- Replace the center `tracking-header-trust` div (lines 322-347) with two `Link` buttons:
  - **AI Scan** linking to `/scan-room` with `Scan` icon
  - **Manual Builder** linking to `/online-estimate` with `Package` icon
- Use `useLocation()` (already imported via react-router-dom) to highlight the active route
- Style the active button with the existing `tru-qb-title-accent` / primary color treatment and a subtle glow
- Style the inactive button as a ghost/outline variant

### File: `src/pages/ScanRoom.tsx`
- Add the same sticky header bar that currently exists on OnlineEstimate (the `tracking-header` pattern) if not already present, or update the existing header
- Include the same two navigation buttons so users can toggle back to Manual Builder from the Scan page
- The AI Scan button will be highlighted here instead

### Styling approach
- Use existing CSS classes (`tracking-header`, etc.) for consistency
- Add inline or utility styles for the toggle button states (active vs inactive)
- Responsive: on small screens, hide label text and show icon-only with the existing Tooltip component
