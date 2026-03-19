

## Fix Header Issues: Black Bar, White Space, and Logo at Zoom

Three problems identified:

### Problem 1: Black bar behind header
The `SiteShell.tsx` wraps the header in `<div className="dark pt-2 px-4 md:px-6 pb-[25px] relative z-10">`. The `dark` class forces a dark theme context, and the `bg-background` on the outer sticky div creates a visible dark band. The padding (`pt-2`, `pb-[25px]`) adds extra space around the navbar.

**Fix**: Make the sticky header wrapper transparent so the hero shows through behind it. Remove the `dark` class wrapper's implicit background by adding `bg-transparent` and remove excess padding.

### Problem 2: White/dead space above hero
The `-80px` margin isn't enough to fully compensate for the header area height. The sticky wrapper with padding creates ~100px+ of occupied space.

**Fix**: Increase the negative margin on `.tru-hero-wrapper` and also remove the gradient fade div below the header (line 34 in SiteShell). Make the outer sticky div background transparent.

### Problem 3: Logo breaks at zoom
The logo has 6 layers of heavy `drop-shadow` filters with huge radii (up to 320px). At different zoom levels, this creates rendering artifacts and excessive bleed. The filter is applied inline in Header.tsx.

**Fix**: Reduce the drop-shadow stack to 2-3 modest layers (max ~30px radius) so it remains crisp at all zoom levels. Move from inline style to CSS class for consistency.

### Files Modified

**`src/components/layout/SiteShell.tsx`**
- Make the sticky header wrapper background transparent (`bg-transparent`)
- Remove or reduce the padding on the dark wrapper div
- Remove the gradient fade div below the header

**`src/components/layout/Header.tsx`**
- Replace the 6-layer mega drop-shadow with a cleaner 2-layer white glow

**`src/index.css`**
- Adjust `.tru-hero-wrapper` negative margin if needed after SiteShell changes
- Add a `.header-logo-glow` class with a sensible white underglow

