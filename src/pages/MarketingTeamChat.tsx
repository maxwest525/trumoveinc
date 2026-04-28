import MarketingShell from "@/components/layout/MarketingShell";
import AgentTeamChat from "@/pages/AgentTeamChat";

export default function MarketingTeamChat() {
  return (
    <MarketingShell breadcrumb=" / Team Chat">
      <div className="h-[calc(100vh-6rem)] overflow-hidden rounded-lg border border-border bg-card">
        <AgentTeamChat embedded />
      </div>
    </MarketingShell>
  );
}