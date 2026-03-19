

## Plan: Individual White Underglow for M-O-V-E Letters

### Challenge
The logo is a single PNG image (`logo.png`), so CSS `drop-shadow` applies uniformly to the entire image — we can't target individual letters within a raster image.

### Approach
Overlay invisible text spelling "MOVE" on top of (or behind) the logo image, with each letter wrapped in its own `<span>`. Each span gets a heavy white `text-shadow` glow. The visible letters still come from the PNG; the per-letter glow comes from the text overlay.

### Changes

**`src/components/layout/Header.tsx`**

1. Remove the massive `drop-shadow` filter from the logo `<img>` (or reduce it significantly to just handle the "Tru" portion's glow).

2. Wrap the logo in a container with `position: relative`, then add an absolutely-positioned text overlay with four spans:
   ```tsx
   <div className="logo-glow-wrapper">
     <img src={logo} alt="TruMove" />
     <div className="logo-letter-glow" aria-hidden="true">
       <span>M</span><span>O</span><span>V</span><span>E</span>
     </div>
   </div>
   ```

3. Each `<span>` gets a layered white `text-shadow` for an individual halo effect.

**`src/index.css`**

Add styles for `.logo-glow-wrapper` and `.logo-letter-glow`:
- Position the text overlay to align with where "MOVE" appears in the logo
- Match the font size/weight/letter-spacing to the logo's typography
- Apply per-letter `text-shadow` with multiple white layers
- Make the text itself transparent (`color: transparent`) so only the glow is visible

### Caveats
- Requires manual fine-tuning of font size, position, and letter-spacing to align with the PNG
- If the logo image ever changes, the overlay will need re-alignment

