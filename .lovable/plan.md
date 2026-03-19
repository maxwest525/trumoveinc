
Fix both regressions with targeted CSS/layout changes:

1. Restore the real logo colors
- In `src/index.css`, remove the global dark-mode rule that inverts every header logo:
  ` .dark header img[alt="TruMove"], .dark .header-logo img { filter: brightness(0) invert(1); }`
- Keep the underglow, but apply it without any color inversion so the uploaded logo stays full-color at all zoom levels.
- If needed, scope any invert rule only to specific legacy monochrome logos, not the main navbar logo.

2. Remove the remaining white gap behind the navbar
- The gap is still happening because the sticky header wrapper in `SiteShell.tsx` still takes up layout height, while the homepage hero is only partially pulled upward.
- Keep the transparent wrapper, but make the homepage compensate exactly for the sticky header height instead of using the current partial overlap.
- In `src/index.css`, replace the current homepage hero offset with a cleaner header-aware setup:
  - increase/adjust `.tru-hero-wrapper` top pull on desktop
  - match `.tru-hero.tru-hero-split` top padding to the real navbar height
  - add matching tablet/mobile values, since the current responsive rules reset the hero padding and can reintroduce visible space on smaller breakpoints

3. Prevent the navbar shell from creating visible bands
- In `src/components/layout/SiteShell.tsx`, remove any remaining extra vertical padding around the header container that creates dead space above the hero.
- Keep the shell transparent so the hero image shows through cleanly.

4. Keep the logo glow, but make it crisp
- In `src/index.css`, keep `.header-logo-glow` subtle and separate from color transforms:
  - modest white drop-shadows only
  - no brightness/invert filters
  - no giant blur stack that breaks at zoom

Files to update
- `src/index.css`
  - remove navbar logo invert rule
  - refine `.header-logo-glow`
  - recalibrate `.tru-hero-wrapper` and `.tru-hero.tru-hero-split`
  - add responsive hero offset fixes
- `src/components/layout/SiteShell.tsx`
  - trim wrapper padding so it no longer creates visible dead space

Expected result
- The navbar logo keeps its original colors instead of turning white.
- The homepage hero background sits directly behind the navbar with no white band.
- The header still floats cleanly, and the glow remains visible without zoom artifacts.
