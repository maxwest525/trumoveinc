

## Apply Green Neon Glow to Logo

The logo currently has a 6-layer **white** underglow via `drop-shadow` filters. The user wants this changed to a **green** neon glow matching the brand green, similar to the effect on the "Move." headline text.

### Changes

**File: `src/components/layout/Header.tsx`** (line ~41)

Replace the white `rgba(255,255,255,...)` drop-shadow values with green `rgba(34,197,94,...)` (the brand green). This will create a green neon bloom radiating from the green parts of the logo, giving it that luminous underglow effect.

The layers would go from tight/bright green close to the logo to softer/wider green further out, creating the characteristic neon glow.

