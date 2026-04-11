import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LegacyPageBannerProps {
  newPath: string;
  newPageName: string;
}

const LegacyPageBanner = ({ newPath, newPageName }: LegacyPageBannerProps) => {
  const navigate = useNavigate();

  return (
    <Alert className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-amber-800 dark:text-amber-200 text-sm">
          This page has been consolidated into <strong>{newPageName}</strong>.
        </span>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50 shrink-0"
          onClick={() => navigate(newPath)}
        >
          Go to {newPageName} <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default LegacyPageBanner;
