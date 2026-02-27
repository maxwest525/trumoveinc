

# Upgrade Landing Page Builder with Firecrawl Brand Extraction

## The Problem
The current landing page templates (both in `AILandingPageGenerator.tsx` and `WebsitePreviewBuilder.tsx`) use hardcoded inline styles with generic colors, layouts, and typography. They look functional but "samey" -- standard dark/light themes with predictable gradient heroes, badge-heavy designs, and cookie-cutter layouts.

## The Solution
Build a **Brand Extraction Pipeline** that uses Firecrawl to scrape stunning reference websites, extract their visual DNA (colors, fonts, spacing, component styles), and inject those styles into the landing page generator -- so users can create pages that look like they were designed by a top agency.

---

## What We'll Build

### 1. Firecrawl Edge Functions (Backend)
Create the 4 Firecrawl edge functions (`firecrawl-scrape`, `firecrawl-search`, `firecrawl-map`, `firecrawl-crawl`) following the standard pattern. These are the plumbing that lets us call Firecrawl from the frontend.

### 2. Firecrawl API Client (Frontend)
Create `src/lib/api/firecrawl.ts` with typed methods for scrape, search, map, and crawl -- calling the edge functions above.

### 3. Brand Extractor Component
Create a new **"Style Extractor"** panel in the landing page builder flow that:
- Lets users paste 1-3 reference website URLs
- Scrapes each URL using Firecrawl with `formats: ['branding', 'screenshot', 'html']`
- Displays extracted brand identity: color palette, fonts, typography scale, spacing, button styles, component patterns
- Shows a side-by-side screenshot preview of the source site
- Lets users pick and mix elements (e.g., "use colors from Site A, typography from Site B")

### 4. Theme Engine Upgrade
Upgrade the existing theme system in `AILandingPageGenerator.tsx` to accept extracted brand data:
- Currently uses a simple `theme` object with `primary`, `secondary`, `primaryDark`, etc.
- Extend it to support full branding: font families, font sizes, spacing units, border radii, button styles, gradients, and shadows extracted from reference sites
- Apply these extracted styles to all 6 template types (quote-funnel, comparison, calculator, testimonial, local-seo, long-form)

### 5. Premium Template Refresh
Upgrade the 6 AI landing page templates with more dynamic, modern design patterns:
- Replace generic gradient heroes with glassmorphism, mesh gradients, and asymmetric layouts
- Add micro-interactions (hover effects, scroll reveals) via CSS
- Improve typography hierarchy with variable weight and size scales
- Add modern UI patterns: bento grids, floating cards, grain textures, and animated borders
- Make each template genuinely distinct in personality, not just color-swapped versions of the same layout

### 6. "Steal This Style" Quick-Pick
Add a curated list of ~5 pre-analyzed premium website styles (already extracted) so users can one-click apply a high-end look without waiting for a scrape. Think: "Stripe-style", "Linear-style", "Vercel-style", "Apple-style", "Notion-style".

---

## Technical Details

### Files to Create
- `supabase/functions/firecrawl-scrape/index.ts` -- Scrape endpoint
- `supabase/functions/firecrawl-search/index.ts` -- Search endpoint  
- `supabase/functions/firecrawl-map/index.ts` -- Map endpoint
- `supabase/functions/firecrawl-crawl/index.ts` -- Crawl endpoint
- `src/lib/api/firecrawl.ts` -- Frontend API client
- `src/components/demo/ppc/BrandExtractor.tsx` -- Brand extraction UI panel

### Files to Modify
- `src/components/demo/ppc/AILandingPageGenerator.tsx` -- Integrate brand extractor, upgrade theme engine, refresh all 6 template renders with modern design patterns
- `src/components/demo/ppc/WebsitePreviewBuilder.tsx` -- Allow extracted themes to be applied to the 6 "Build Manual" templates as well

### Data Flow
```text
User pastes URL --> Firecrawl scrape (branding format) --> Extract colors/fonts/spacing
     |                                                            |
     v                                                            v
Screenshot preview                                    Merge into theme object
                                                              |
                                                              v
                                                   Apply to template render
                                                   (inline styles updated)
```

### Key Dependencies
- Firecrawl connector (already connected)
- `react-markdown` (already installed) for rendering scraped content if needed
- No new packages needed

