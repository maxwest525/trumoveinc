import MarketingShell from "@/components/layout/MarketingShell";

export default function MarketingDomainAuthority() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Domain Authority" }]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Domain Authority</h1>
        <p className="text-muted-foreground text-sm">Track your domain authority and ranking signals. Coming soon.</p>
      </div>
    </MarketingShell>
  );
}
