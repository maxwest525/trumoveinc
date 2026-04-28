// v1.0.3 - install global error capture for diagnostics
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorCapture } from "./lib/errorCapture";

installGlobalErrorCapture();

createRoot(document.getElementById("root")!).render(<App />);
