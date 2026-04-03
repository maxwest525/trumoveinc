import MarketingShell from "@/components/layout/MarketingShell";

export default function MarketingBacklinks() {
  return (
    <MarketingShell breadcrumbs={[{ label: "Backlinks" }]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Backlinks</h1>
        <p className="text-muted-foreground text-sm">Monitor and manage your backlink profile. Coming soon.</p>
      </div>
    </MarketingShell>
  );
}
