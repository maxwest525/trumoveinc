

## Comprehensive Mobile CSS Fix -- All Pages

### Issues Identified from Screenshots

1. **Homepage -- AI Scanner section**: The 3-column grid (`tru-ai-header-row`) shows a vertical black line and huge empty space below "Scan Your Home" on mobile. The scanner center and detection right panels don't properly fill the viewport width.

2. **Homepage -- Tracking section**: Maps show but the satellite/road map panels may not fill width properly, and the text content for "Track. Monitor. Arrive." section is cramped.

3. **Book page -- Video consult header clipped**: The "TruMove Video Consult" header text is cut off on the left side. The video call toolbar icons ("Whiteboard", "Volume", etc.) overflow horizontally.

4. **Book page -- Contact cards overflow**: The "Ready to Connect" section with Video Call, Voice Call, Email Us, Text Us cards bleeds past viewport edges.

5. **Carrier Vetting page -- Large white gap**: Excessive whitespace between the header/trust strip and the "CARRIER VETTING" command center strip. The hero headline text is also clipped.

6. **Online Estimate page -- Inventory builder sidebar**: The two-column sidebar + content layout is cramped at 390px. Room list and inventory grid overlap.

7. **Chat widget**: Still overlapping form fields and CTA buttons on some pages despite previous fix.

### Plan

All changes scoped to `@media (max-width: 768px)` in `src/index.css` only. Desktop remains 100% untouched.

**File: `src/index.css`** (append to existing mobile block at ~line 34210)

1. **AI Scanner 3-column grid**: Force `tru-ai-header-row` to `display: flex; flex-direction: column` on mobile, with each child (`tru-ai-content-left`, `tru-ai-scanner-center`, `tru-ai-detection-right`) set to `width: 100%; max-width: 100%`. Set `tru-ai-live-scanner` to `aspect-ratio: 4/3; height: auto` instead of fixed min-height.

2. **Book page video header**: Fix the `video-consult-header` overflow by adding `overflow: hidden; padding: 12px 16px` on mobile. Fix the video toolbar to wrap or scroll horizontally. Ensure the "TruMove Video Consult" title doesn't clip by resetting any negative margins or left offsets.

3. **Book page contact section**: The "Ready to Connect" cards use a grid that may overflow -- force single-column or 2-column constrained grid on mobile with `padding: 0 16px`.

4. **Carrier Vetting white gap**: The gap comes from the SiteShell sticky header taking extra space plus the vetting hero section having large top padding. Reduce `tru-vetting-hero` top padding on mobile and ensure the command center strip (`sticky top-[6.375rem]`) uses the correct mobile offset.

5. **Online Estimate inventory builder**: The `tru-qb-body` two-panel layout needs the sidebar to collapse or become a horizontal scrollable row on mobile. Force `flex-direction: column` if not already done, and limit the room list width.

6. **Chat widget z-index and position**: Move the chat widget higher (`bottom: 80px`) to avoid overlapping form submit buttons, and reduce its width further on very small screens.

7. **General section padding**: Add `padding-left: 16px; padding-right: 16px` to all major section containers to prevent content from touching viewport edges.

### Technical Details

- All CSS changes are `@media (max-width: 768px)` scoped
- Using `!important` overrides where existing desktop styles use high specificity
- No JavaScript or component file changes needed
- Edits go into the existing mobile block at the end of `src/index.css` (around line 34210-34356)
- Some fixes also need a `@media (max-width: 480px)` sub-breakpoint for extra-small phones

