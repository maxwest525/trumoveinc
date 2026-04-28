import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import canonicalPrerender from "./vite-plugin-canonical";

const SUPABASE_URL_FALLBACK = "https://fsxoskcionoobxuepqeg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImZzeG9za2Npb25vb2J4dWVwcWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MDA5MDUsImV4cCI6MjA4NjI3NjkwNX0.-blTL1lq4DJ92GCokkOIS3HeROGhMOiRMfZmufUHwZg";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), canonicalPrerender()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || SUPABASE_URL_FALLBACK),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY_FALLBACK),
  },
  optimizeDeps: {
    include: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-dialog",
      "@radix-ui/react-switch",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-alert-dialog",
      "react",
      "react-dom",
    ],
  },
}));
