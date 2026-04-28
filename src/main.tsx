import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.documentElement.dataset.build = "crm-env-refresh-20260428";

createRoot(document.getElementById("root")!).render(<App />);
