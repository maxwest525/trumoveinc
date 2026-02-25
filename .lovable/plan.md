
## Restore the Feature Trust Strip

The strip between the AI scan demo and the Track/Monitor section was accidentally modified. It was reduced to just "AI-Powered Moving" and is no longer rendered in its correct position. Here's what needs to happen:

### What Changed (The Problem)
1. **FeatureTrustStrip.tsx** was reduced from 6 items to just 1 ("AI-Powered Moving")
2. The component is imported but never rendered between the AI scan demo and ShipmentTrackerSection
3. The CSS font-size was bumped to 22px (meant for a different strip), making it too large for 6 items

### What Will Be Restored

**1. Restore `src/components/FeatureTrustStrip.tsx`** with all 6 original items matching the screenshot:
- AI ROOM SCANNER (Home icon)
- LIVE GPS TRACKING (MapPin icon)
- VIDEO CONSULTATIONS (Video icon)
- CARRIER VETTING (Shield icon)
- NATIONWIDE COVERAGE (Truck icon)
- VERIFIED ESTIMATES (CheckCircle/BadgeCheck icon)

Each with green icons and dot separators, matching the standard 12px bold style.

**2. Add `<FeatureTrustStrip />` back into `src/pages/Index.tsx`** between the AI scan demo section (after line 1872) and the ShipmentTrackerSection (line 1877).

**3. Revert CSS in `src/index.css`** for `.feature-trust-item` back to 12px font-size and 16px icon size to match the standard trust strip style (the 22px enlargement was only meant for the separate "AI-Powered Moving" header strip).

### Technical Details
- File changes: `FeatureTrustStrip.tsx`, `Index.tsx` (1 line insert), `index.css` (font-size revert)
- Icons from `lucide-react`: Home, MapPin, Video, Shield, Truck, BadgeCheck
- All styling uses existing `.feature-trust-strip` CSS classes
