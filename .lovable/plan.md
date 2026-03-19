

## Contact Section Redesign

**Current layout**: Contact Us headline (left) → Agent photo → Send a Message → Call/Text stack → Trudy/Video stack

**New layout**: Contact Us headline (left) → Agent photo (full viewable height, no logo cutoff) → Send a Message (same size) → 4 stacked cards (Call Us, Text Support, Talk to Trudy, Book Video Consult)

### Changes to `src/pages/Index.tsx` (lines 1686–1801)

1. **Agent photo (Col 2)**: Change from `md:w-48` to a wider width (e.g. `md:w-64`) and ensure `object-contain` or proper `object-cover` + `object-top` so the logo in the image isn't cut off. Remove the fixed height constraint so it fills the viewable area naturally.

2. **Send a Message (Col 3)**: Keep as `flex-1` with the same padding, form, and styling — no changes.

3. **Replace Cols 4 & 5 with a single stacked column** (~`md:w-44`): Stack all 4 cards vertically:
   - **Call Us** — keep text/link, remove the phone icon circle
   - **Text Support** — keep text/link, remove the message icon circle
   - **Talk to Trudy** — keep as a button dispatching `trudy-start`, remove the Mic icon circle, remove the HoverCard wrapper
   - **Book Video Consult** — keep as a button navigating to `/site/book`, remove the preview image inside the card, remove the HoverCard wrapper

4. **Remove unused imports**: `trudyVoicePreview` and `videoConsultPreview` hover card content blocks.

### Summary
- 4 columns total: Headline | Wide photo | Message form | 4 stacked mini-cards
- Photo uses full width without cropping the logo
- Small cards are simplified — no icons, no hover previews

