import { Outlet } from "react-router-dom";
import CanonicalTag from "./CanonicalTag";

/**
 * Wraps all /site/* routes to automatically inject a canonical tag
 * based on the current route path.
 */
export default function SiteCanonicalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CanonicalTag />
      {children}
    </>
  );
}
