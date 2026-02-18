
# Integrating Trudy's ElevenLabs Embed Widget

## Overview
Add Trudy's ElevenLabs conversational AI agent to the site in two ways:
1. **Floating widget on all pages** -- replace or augment the current floating truck chat button
2. **Dedicated customer service page** -- a new `/customer-service` route with a full-page Trudy experience

## What We Need From You
- Your ElevenLabs embed link or agent embed code (paste it in the next message after approving this plan)

---

## Part 1: Floating Widget (All Pages)

**Approach**: ElevenLabs provides an embeddable widget via a `<script>` tag or iframe snippet. We'll add this globally so it appears on every page.

- Create a new component `src/components/ElevenLabsTrudyWidget.tsx` that injects the ElevenLabs embed script/iframe
- Add it to `src/App.tsx` alongside (or replacing) the existing `FloatingTruckChat` component
- Style it to sit in the bottom-right corner, mobile-friendly, and not conflict with existing UI elements
- The existing `FloatingTruckChat` truck button can either be removed or kept as a secondary element -- we can decide once we see how the ElevenLabs widget looks

## Part 2: Dedicated Customer Service Page

**Approach**: Create a full-page experience at `/customer-service` featuring Trudy front and center.

- Create `src/pages/CustomerService.tsx` with:
  - A hero section introducing Trudy as the virtual customer service rep
  - The ElevenLabs embed widget displayed prominently (larger/centered)
  - Info cards about what Trudy can help with (quotes, tracking, scheduling, FAQ)
  - Fallback contact options (phone, email) below the widget
- Add the route to `src/App.tsx`
- Add a "Customer Service" link to the site navigation

---

## Technical Details

### Files to create
- `src/components/ElevenLabsTrudyWidget.tsx` -- wrapper component for the ElevenLabs embed
- `src/pages/CustomerService.tsx` -- dedicated Trudy page

### Files to modify
- `src/App.tsx` -- add widget globally + new route
- `src/components/layout/Header.tsx` -- add nav link to Customer Service page

### No backend changes needed
The ElevenLabs embed is self-contained -- no edge function changes required since the embed handles its own authentication.
