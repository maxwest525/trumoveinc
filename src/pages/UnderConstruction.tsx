import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo.png";

function isCrmOrDev() {
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host.includes("lovable.app") ||
    host.includes("lovableproject.com") ||
    host.startsWith("crm.")
  );
}

export default function UnderConstruction() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCrmOrDev()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!isCrmOrDev()) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <img src={logoImg} alt="TruMove" className="h-8 dark:invert" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Construction className="w-7 h-7 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Under Construction
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Looks like this page is under construction.
            <br />
            Looks like TruMove is helping you move back home.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/85 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
