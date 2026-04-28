// v1.0.2 - force rebuild to inject VITE_SUPABASE_URL
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
