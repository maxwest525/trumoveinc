

## Add Color Pop to the Hero Form (No Green)

The form is currently all grays, whites, and blacks — flat and lifeless. The fix is **contrast and warmth**, not green accents.

### Approach: Dark Header + Warm Amber Accent

**1. Form Header — Flip to Dark** (`src/index.css`)
- Change `.tru-qb-form-header-pill` background from `hsl(220 15% 93%)` (light gray) to `hsl(var(--tm-ink))` (near-black)
- Title and subtitle text become white
- This creates immediate visual weight and contrast — the form "pops" off the page

**2. Inputs — Warm amber focus states** (`src/index.css`)
- On `:hover` and `:focus`, use a warm amber/orange border (`hsl(35 95% 55%)`) instead of the current ink/green
- Subtle warm `box-shadow` on focus: `0 0 0 3px hsl(35 95% 55% / 0.15)`
- Placeholders stay muted gray — the amber only appears on interaction

**3. CTA Button — Amber highlight stripe** (`src/index.css`)
- Add a thin amber bottom-border (2px) to the dark CTA button so it pops against the dark surface
- On hover, the amber border thickens slightly or glows warm

**4. Calendar Icon** (`src/pages/Index.tsx`)
- Give the Calendar icon a warm amber color class (`text-amber-500`) instead of the current muted opacity

### Dark Mode
- Dark header stays dark but uses a slightly lighter shade to differentiate from the page background
- Amber accents remain consistent across both modes

### Files Modified
- `src/index.css` — header background flip, input hover/focus, button accent
- `src/pages/Index.tsx` — calendar icon color

