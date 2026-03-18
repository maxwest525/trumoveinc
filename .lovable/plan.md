

## Issues Identified

1. **"Fill out the form" CTA prompt** — user wants it deleted
2. **Hero too tall** — `min-height: calc(100vh - 280px)` creates massive dead space; padding is `32px 64px 80px` (80px bottom)
3. **Input fields don't match** — New contact inputs use class `tru-qb-text-input` which has NO CSS definition. The location autocomplete inputs use `tru-qb-input` which has proper styling (44px height, rounded-16px, centered text, borders). The new fields render as unstyled browser defaults.
4. **Form header deleted but min-height remains** — `.tru-floating-form-card` has `min-height: 480px` and `.tru-floating-form-content` has `min-height: 320px`, creating dead whitespace where the old header + content used to fill that space.
5. **No form validation** — Name, phone, email have no validation before "Talk to Support" submission.

## Plan

### File 1: `src/pages/Index.tsx` (~lines 1331-1475)

- **Delete** the `<p className="tru-hero-cta-prompt">` block (lines 1343-1345)
- **Replace** contact input classes from `tru-qb-text-input` to `tru-qb-input` so they match the location fields' styling
- **Add phone formatting** — import `formatPhoneNumber`, `isValidPhoneNumber` from `@/lib/phoneFormat` and apply to phone input's onChange
- **Add validation** on "Talk to Support" click:
  - Name must be non-empty
  - Email must contain `@` and `.`
  - Phone must be valid (10 digits via `isValidPhoneNumber`)
  - Show inline error state (`has-error` class) on invalid fields and a text error message
- **Add validation state** — use existing `formError` state or add a local validation error string

### File 2: `src/index.css`

- **Hero grid**: Reduce `min-height` from `calc(100vh - 280px)` to `auto`, reduce bottom padding from `80px` to `32px`
- **Left column**: Reduce `margin-top` from `-40px` to `-60px` to push content higher
- **Form card**: Reduce `min-height` from `480px` to `auto` on the hero variant (`.tru-hero-form-panel .tru-floating-form-card`)
- **Form content**: Reduce `min-height` from `320px` to `auto`, tighten padding from `32px 28px 20px` to `24px 24px 16px` for the hero form

