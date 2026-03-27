/**
 * Custom Vite plugin: Static Canonical Tag Injection
 *
 * APPROACH: At build time, this plugin copies the built index.html into
 * per-route directories (e.g., dist/site/online-estimate/index.html) with
 * the correct <link rel="canonical"> tag injected into the static <head>.
 *
 * WHY: The app is a client-side SPA (<div id="root"></div>). Tags injected
 * via React Helmet only appear after JS executes — they are invisible to
 * crawlers that read raw HTML and to "View Page Source". This plugin ensures
 * every public route's initial HTML contains a proper canonical tag.
 *
 * HOW: We define the public routes and their canonical URLs, then after Vite
 * finishes building, we create copies of index.html in the matching directory
 * structure with the canonical link inserted right after <head>.
 */

import { Plugin } from "vite";
import fs from "fs";
import path from "path";

const SITE_ORIGIN = "https://trumoveinc.com";

/** All customer-facing routes under /site that map to public trumoveinc.com paths */
const PUBLIC_ROUTES: { route: string; canonicalPath: string }[] = [
  { route: "/site", canonicalPath: "/" },
  { route: "/site/online-estimate", canonicalPath: "/online-estimate" },
  { route: "/site/book", canonicalPath: "/book" },
  { route: "/site/vetting", canonicalPath: "/vetting" },
  { route: "/site/vetting-dashboard", canonicalPath: "/vetting-dashboard" },
  { route: "/site/carrier-vetting", canonicalPath: "/carrier-vetting" },
  { route: "/site/faq", canonicalPath: "/faq" },
  { route: "/site/about", canonicalPath: "/about" },
  { route: "/site/privacy", canonicalPath: "/privacy" },
  { route: "/site/terms", canonicalPath: "/terms" },
  { route: "/site/property-lookup", canonicalPath: "/property-lookup" },
  { route: "/site/auth", canonicalPath: "/auth" },
  { route: "/site/scan-room", canonicalPath: "/scan-room" },
  { route: "/site/classic", canonicalPath: "/classic" },
  { route: "/site/track", canonicalPath: "/track" },
  { route: "/site/customer-service", canonicalPath: "/customer-service" },
];

export default function canonicalPrerender(): Plugin {
  return {
    name: "vite-plugin-canonical-prerender",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(distDir, "index.html");

      if (!fs.existsSync(indexPath)) {
        console.warn("[canonical-prerender] dist/index.html not found, skipping.");
        return;
      }

      const baseHtml = fs.readFileSync(indexPath, "utf-8");

      for (const { route, canonicalPath } of PUBLIC_ROUTES) {
        const canonicalUrl =
          canonicalPath === "/"
            ? `${SITE_ORIGIN}/`
            : `${SITE_ORIGIN}${canonicalPath}`;

        const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;

        // Inject canonical right after <head> (or after existing <head> content)
        // Remove any existing canonical first to avoid duplicates
        let html = baseHtml.replace(
          /<link\s+rel="canonical"[^>]*>/gi,
          ""
        );
        html = html.replace("<head>", `<head>\n    ${canonicalTag}`);

        // Write to route directory: e.g. dist/site/online-estimate/index.html
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");

        console.log(`[canonical-prerender] ${route} → ${canonicalUrl}`);
      }

      // Also inject root canonical into the base index.html (serves / route)
      let rootHtml = baseHtml.replace(
        /<link\s+rel="canonical"[^>]*>/gi,
        ""
      );
      const rootCanonical = `<link rel="canonical" href="${SITE_ORIGIN}/" />`;
      rootHtml = rootHtml.replace("<head>", `<head>\n    ${rootCanonical}`);
      fs.writeFileSync(indexPath, rootHtml, "utf-8");
      console.log(`[canonical-prerender] / (root) → ${SITE_ORIGIN}/`);
    },
  };
}
