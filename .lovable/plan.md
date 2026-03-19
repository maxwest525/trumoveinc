
Goal: keep the hero as-is, but make the top navbar truly stable so zooming does not create a half-desktop / half-mobile header.

Plan

1. Audit and unify the header breakpoints
- Remove the mixed breakpoint logic causing different pieces to switch at different widths:
  - desktop nav currently hides at `max-width: 1000px`
  - “Contact Us” currently hides at Tailwind `md` (`768px`)
- Replace this with one shared breakpoint so the entire header changes modes together.

2. Rebuild the header layout to use fixed tracks instead of flexible drift
- Change the header shell from a loose flex layout to a more stable 3-zone layout:
  - left: logo
  - center: nav
  - right: contact actions / mobile toggle
- This prevents the logo and nav from shifting position as zoom changes available width.

3. Stop partial collapse behavior on desktop zoom
- Keep the desktop header active through normal desktop zoom ranges.
- Only switch to the mobile menu at a much smaller true layout width.
- If needed, slightly tighten desktop spacing first before collapsing:
  - smaller nav gaps
  - slightly smaller horizontal padding
  - narrower contact group

4. Remove nested spacing that amplifies header movement
- Clean up overlapping outer/inner horizontal padding between `SiteShell` and `Header`.
- Make the floating header width, centering, and padding consistent so it does not appear to “slide” or crop differently at 80%, 100%, and 125%.

5. Preserve the hero sizing that now fits
- Do not shrink the hero again.
- Only adjust the top section spacing if the stabilized header needs a small buffer above the hero.

Technical details
- Files to update:
  - `src/components/layout/Header.tsx`
  - `src/components/layout/SiteShell.tsx`
  - `src/index.css`
- Main root cause found:
  - the header uses inconsistent responsive rules (`1000px` in CSS vs `md`/`768px` in JSX), so zoom changes trigger different parts independently.
- Recommended implementation direction:
  - one breakpoint for all header mode changes
  - CSS grid for header structure
  - reduced dependency on `flex-1`, `margin-left: auto`, and mixed Tailwind/CSS visibility rules

Expected result
- At 80%, 100%, and 125%, the top bar should remain visually consistent instead of partially collapsing.
- The hero stays fully visible.
- The header only switches to mobile when the viewport is genuinely narrow, not just because browser zoom crossed a mismatched breakpoint.
