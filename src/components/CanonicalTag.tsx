import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://trumoveinc.com";

/**
 * Maps internal /site/... routes to the public canonical URL on trumoveinc.com.
 * E.g. /site/online-estimate → https://trumoveinc.com/online-estimate
 *      /site               → https://trumoveinc.com/
 */
function buildCanonicalUrl(pathname: string): string {
  // Strip the /site prefix for canonical (public site lives at root domain)
  let publicPath = pathname.replace(/^\/site/, "") || "/";

  // Normalize: no trailing slash except root
  if (publicPath !== "/" && publicPath.endsWith("/")) {
    publicPath = publicPath.slice(0, -1);
  }

  return `${SITE_ORIGIN}${publicPath}`;
}

interface CanonicalTagProps {
  /** Override the auto-generated canonical URL */
  href?: string;
  title?: string;
  description?: string;
}

export default function CanonicalTag({ href, title, description }: CanonicalTagProps) {
  const { pathname } = useLocation();
  const canonicalUrl = href || buildCanonicalUrl(pathname);

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
