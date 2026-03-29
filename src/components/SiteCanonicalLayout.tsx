import CanonicalTag from "./CanonicalTag";
import CookieConsent from "./CookieConsent";

/**
 * Wraps all /site/* routes to automatically inject a canonical tag
 * and the cookie consent banner (customer-facing only).
 */
export default function SiteCanonicalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CanonicalTag />
      {children}
      <CookieConsent />
    </>
  );
}
