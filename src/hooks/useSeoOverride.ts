import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads SEO overrides from the database for the current page path
 * and applies document.title + meta description dynamically.
 */
export function useSeoOverride() {
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function apply() {
      const { data } = await supabase
        .from("seo_overrides" as any)
        .select("title, description")
        .eq("url_path", pathname)
        .maybeSingle();

      if (cancelled || !data) return;

      const row = data as any;
      if (row.title) {
        document.title = row.title;
      }
      if (row.description) {
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = "description";
          document.head.appendChild(meta);
        }
        meta.content = row.description;
      }
    }

    apply();
    return () => { cancelled = true; };
  }, [pathname]);
}
