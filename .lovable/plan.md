

# Dedicated Website + Ad Campaign Generator Views

## Overview

When users select "Website" or "Ad Campaign" in Build Manual and click Generate, they currently get routed to existing tabs. This plan adds two dedicated generator views that render in-place with polished previews, template pickers, and dynamic data binding.

## New Components (4 files)

### 1. GeneratorPickerCard.tsx
An intermediate "Choose a Generator" card shown after clicking Generate for Website or Ad Campaign output types.

- Header: "Choose a Generator" with subtitle "Preview-only generators, no live publishing yet."
- Two tiles depending on output type:
  - Website/Landing: "Website + Landing Preview Builder" tile with "Open Preview Builder" button
  - Ad Campaign: "Ad Campaign Builder" tile with "Open Ad Builder" button
- Clicking the button transitions to the corresponding dedicated view

### 2. WebsitePreviewBuilder.tsx
Full preview environment for Website/Landing Page generation.

**Template Style Picker** -- 5 selectable pills:

| Style | Inspiration | Background | Accent |
|-------|------------|------------|--------|
| Editorial Dark | Ubernatural | Pure black #000 | White/neutral |
| Clean Split Light | Pixel.ai | White #fff | Teal #0d9488 |
| Enterprise Dark Form | Ceros | Dark #0a0a0a | Blue-gray |
| Promo Dark Gradient | Madgicx | Navy-purple gradient | Purple #a855f7 |
| Corporate Light Video | GoHighLevel | Light #f8fafc | Blue #3b82f6 |

**Controls:**
- Light/Dark toggle (affects ONLY the preview canvas, not app UI)
- Landing Page / Website toggle
- When "Website" is selected, tabs appear: Home, Services, Reviews, Quote Form (swap preview sections, no real routing)

**Preview Canvas:**
- Uses existing ScaledPreview component for 1440px responsive rendering
- Shared section structure across all templates: Hero, Social Proof Strip, Benefits, Testimonials, CTA, Footer
- Each template varies only in typography, spacing density, accent colors, and layout pattern
- All accent colors scoped strictly inside the preview canvas

### 3. AdCampaignBuilder.tsx
Ad copy generator with platform selection and matching landing preview.

**Platform Multi-Select** (display only, no backend):
Facebook Feed, Facebook Reels, Instagram Feed, Instagram Stories, Instagram Reels, TikTok, YouTube Shorts, Google Search, Google Performance Max, Google Display, Microsoft Ads, LinkedIn, X, Pinterest

**"Generate Copy Preview" button** produces mock ad copy sections:
- Platform-grouped cards showing headlines, descriptions, and CTA text
- Populated with user's selected keywords, locations, audience

**"Match Landing Style" dropdown:**
- Selects one of the 5 template styles
- Renders the same preview canvas from WebsitePreviewBuilder beneath the ad copy

### 4. Template preview sub-components (inside WebsitePreviewBuilder)
Each of the 5 templates rendered as a self-contained section within the preview canvas. All follow the same structure (Hero > Social Proof > Benefits > Testimonials > CTA > Footer) but with different visual treatments.

## Modified Files

### MarketingDashboard.tsx
- Add two new view modes to the union type: `'generator-picker'` and `'website-builder'` and `'ad-builder'`
- Store the BuildSelections in state when transitioning from manual build
- Update `handleManualBuild`:
  - If outputType is `'website'` or `'ad'`: set viewMode to `'generator-picker'` (instead of routing to existing tabs)
  - If outputType is `'landing'`: keep current behavior (goes to AILandingPageGenerator)
- Add render blocks for the new view modes
- Update the page title in the top bar for each new view mode

## Data Binding

User's BuildSelections (keywords, locations, demographics) populate:
- **Headline**: First keyword + first location (e.g., "Expert Long Distance Moving in Los Angeles")
- **Subheadline**: Derived from audience segment
- **3 benefit bullets**: Generated from keywords list
- **2 testimonials**: Using location names for authenticity
- **CTA button label**: Based on output type context
- Missing inputs get sensible defaults clearly marked as placeholder text

## Flow Diagram

```text
Build Manual -> Select data -> Pick Output Type -> Click Generate
  |
  +--> Landing Page: existing flow (AILandingPageGenerator) -- UNCHANGED
  |
  +--> Website: GeneratorPickerCard -> "Open Preview Builder" -> WebsitePreviewBuilder
  |                                                              (5 templates, light/dark toggle,
  |                                                               Home/Services/Reviews/Quote tabs)
  |
  +--> Ad Campaign: GeneratorPickerCard -> "Open Ad Builder" -> AdCampaignBuilder
                                                                (platform list, copy preview,
                                                                 matching landing style dropdown)
```

## Brand Safety

- Template accent colors (teal, purple, blue, etc.) exist ONLY inside preview canvas components
- The surrounding app UI (cards, buttons, nav, top bar) keeps all existing brand tokens unchanged
- Light/dark toggle changes only the preview canvas background and text, not the app theme
- No existing pages, tabs, or navigation are redesigned or restyled

## Acceptance Checklist

- Selecting Website output type shows GeneratorPickerCard instead of routing to existing tabs
- Selecting Ad Campaign output type shows GeneratorPickerCard instead of routing to existing tabs
- Clicking "Open Preview Builder" renders Template Picker, Light/Dark toggle, Preview Canvas with 5 styles
- Clicking "Open Ad Builder" renders platform list, copy preview output, and matching landing style preview
- App brand colors remain unchanged outside preview canvas
- No overlapping elements, no broken spacing
- Website preview shows Home/Services/Reviews/Quote Form tab switching
- All 5 template styles render with distinct visual treatments but consistent structure

