import { AnalyticsBuilderPanel, BuildSelections } from "./AnalyticsBuilderPanel";

interface AutoBuildPageProps {
  onBuild: (variationId: string, selections?: BuildSelections) => void;
  onCancel: () => void;
}

export function AutoBuildPage({ onBuild, onCancel }: AutoBuildPageProps) {
  return (
    <AnalyticsBuilderPanel
      mode="auto"
      onBuild={(selections) => onBuild(selections.template, selections)}
      onCancel={onCancel}
    />
  );
}
