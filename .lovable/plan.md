

## Add Redirect Banners to Legacy Marketing Routes

**What**: When a user lands on any of the old/legacy marketing URLs (like `/marketing/integrations`, `/marketing/seo`, `/marketing/blog`, etc.), show a clear banner at the top of the page telling them this page has been consolidated and directing them to the new location.

**How**:

1. **Create a `LegacyPageBanner` component** - A styled alert/banner that says something like:
   - "This page has moved to [New Page Name]" with a link button to navigate there
   - Styled with a subtle amber/yellow background to stand out without being alarming
   - Includes a "Go to [New Page]" button

2. **Add the banner to each legacy page** by mapping old routes to their new destinations:

| Legacy Route | Redirects To |
|---|---|
| `/marketing/integrations` | Settings (Integrations tab) |
| `/marketing/seo` | Content & SEO |
| `/marketing/blog` | Content & SEO (Pipeline tab) |
| `/marketing/analytics` | Dashboard |
| `/marketing/backlinks` | Content & SEO (Backlinks tab) |
| `/marketing/domain-authority` | Content & SEO (Backlinks tab) |
| `/marketing/cro` | Conversion Lab |
| `/marketing/recommendations` | Action Items |
| `/marketing/content-center` | Content & SEO (Pipeline tab) |
| `/marketing/implementation` | Action Items (Implementation tab) |
| `/marketing/ppc` | Advertising |
| `/marketing/competitor-seo` | Competitors |
| `/marketing/templates` | Content & SEO |

3. **Implementation approach**: Rather than editing every legacy page file, replace the legacy route elements in `App.tsx` with a simple wrapper component that renders the old page content with the banner injected at the top via the `MarketingShell`. This keeps it DRY - one component handles all legacy routes.

**Files touched**:
- Create: `src/components/marketing/LegacyPageBanner.tsx`
- Edit: `src/App.tsx` (wrap legacy route elements with banner)

