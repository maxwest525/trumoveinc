import { useSeoOverride } from "@/hooks/useSeoOverride";

/**
 * Placed inside BrowserRouter, applies DB-driven SEO overrides
 * (title, meta description) to the current page.
 */
export function SeoOverrideProvider({ children }: { children: React.ReactNode }) {
  useSeoOverride();
  return <>{children}</>;
}
