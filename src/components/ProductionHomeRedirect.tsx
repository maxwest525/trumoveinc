import { Navigate } from "react-router-dom";
import AgentLogin from "@/pages/AgentLogin";

/**
 * On production domains (trumoveinc.com), redirect "/" to "/site"
 * so customers land on the customer-facing homepage (with cookie banner).
 * On dev/preview domains, show the agent login as before.
 */
export default function ProductionHomeRedirect() {
  const host = window.location.hostname;
  const isDev =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app");

  if (isDev) {
    return <AgentLogin />;
  }

  // Production domain → customer site
  return <Navigate to="/site" replace />;
}
