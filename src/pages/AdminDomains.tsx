import AdminShell from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Globe, ArrowRight, Copy, Check, Server, Shield,
  ExternalLink, CheckCircle2, Circle,
} from "lucide-react";

const DNS_IP = "185.158.133.1";

function CopyValue({ value }: { value: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}
      className="p-1 rounded hover:bg-muted transition-colors shrink-0"
    >
      <Copy className="w-3 h-3 text-muted-foreground" />
    </button>
  );
}

function DnsTable({ domain }: { domain: string }) {
  const rows = [
    { type: "A", name: "@", value: DNS_IP },
    { type: "A", name: "www", value: DNS_IP },
    { type: "TXT", name: "_lovable", value: `lovable_verify=${domain.replace(/\./g, "_")}` },
  ];

  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.name + r.type} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono">
          <Badge variant="outline" className="text-[10px] shrink-0">{r.type}</Badge>
          <span className="text-muted-foreground w-20 shrink-0">{r.name}</span>
          <span className="flex-1 truncate text-foreground">{r.value}</span>
          <CopyValue value={r.value} />
        </div>
      ))}
    </div>
  );
}

export default function AdminDomains() {
  const hostname = window.location.hostname;
  const isCrm = hostname.startsWith("crm.") || hostname === "localhost" || hostname.endsWith(".lovable.app");

  return (
    <AdminShell breadcrumb=" › Domains">
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">Domain Routing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This project serves two experiences from one deployment. The system automatically
            detects which domain a visitor is on and shows the right content.
          </p>
        </div>

        {/* How routing works */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">How Routing Works</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">trumoveinc.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Public customer-facing site — quotes, trust content, booking. No login required.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ArrowRight className="w-3 h-3" />
                <span>Routes: <code className="bg-muted px-1 rounded">/</code> <code className="bg-muted px-1 rounded">/online-estimate</code> <code className="bg-muted px-1 rounded">/about</code> etc.</span>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">crm.trumoveinc.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auth-gated employee CRM — pipeline, dashboards, operations. Login required.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ArrowRight className="w-3 h-3" />
                <span>Routes: <code className="bg-muted px-1 rounded">/agent/*</code> <code className="bg-muted px-1 rounded">/admin/*</code> <code className="bg-muted px-1 rounded">/manager/*</code></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>No configuration needed</strong> — the detection is automatic based on the hostname.
            Any domain starting with <code className="bg-muted px-1 rounded">crm.</code> shows the CRM.
            Everything else shows the customer site.
          </p>
        </Card>

        {/* Current status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">You're currently on</p>
              <p className="text-sm font-mono text-foreground mt-0.5">{hostname}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {isCrm ? "CRM Mode" : "Customer Site Mode"}
            </Badge>
          </div>
        </Card>

        {/* Setup steps */}
        <Card className="p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Setup Guide</h3>
          <p className="text-xs text-muted-foreground -mt-2">
            Connect both <strong>trumoveinc.com</strong> and <strong>crm.trumoveinc.com</strong> as custom domains in your Lovable project settings. Both point to this same app.
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Add DNS records for trumoveinc.com</p>
                <p className="text-xs text-muted-foreground">At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc), add these records:</p>
                <DnsTable domain="trumoveinc.com" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Add DNS records for crm.trumoveinc.com</p>
                <p className="text-xs text-muted-foreground">Add a separate set of records for the CRM subdomain:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono">
                    <Badge variant="outline" className="text-[10px] shrink-0">A</Badge>
                    <span className="text-muted-foreground w-20 shrink-0">crm</span>
                    <span className="flex-1 truncate text-foreground">{DNS_IP}</span>
                    <CopyValue value={DNS_IP} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Connect both domains in Lovable</p>
                <p className="text-xs text-muted-foreground">
                  Go to your Lovable project <strong>Settings → Domains → Connect Domain</strong>.
                  Add <strong>trumoveinc.com</strong> first, then add <strong>crm.trumoveinc.com</strong> as a second domain.
                  Both must be connected to this same project.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-foreground">Publish</p>
                <p className="text-xs text-muted-foreground">
                  Once DNS propagates (up to 72 hours) and SSL is issued, publish the project.
                  Visitors to <strong>trumoveinc.com</strong> see the customer site.
                  Visitors to <strong>crm.trumoveinc.com</strong> see the login screen.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Common Questions</h3>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium text-foreground">Can I use a completely different domain for the CRM instead of a subdomain?</p>
              <p className="text-muted-foreground mt-0.5">
                Yes — update <code className="bg-muted px-1 rounded">hostDetection.ts</code> to recognize your CRM domain.
                For example, if your CRM domain is <code className="bg-muted px-1 rounded">trumovedashboard.com</code>,
                add it to the CRM detection logic. Then connect it in Lovable the same way.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Why do both domains point to the same app?</p>
              <p className="text-muted-foreground mt-0.5">
                Lovable deploys one project as one app. The JavaScript checks the browser's hostname
                at runtime and shows different routes/content accordingly. This is a standard
                multi-tenant pattern — one codebase, multiple experiences.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">What if DNS isn't working?</p>
              <p className="text-muted-foreground mt-0.5">
                Use <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">dnschecker.org</a> to
                verify your records. Make sure there are no conflicting A records. Propagation can take up to 72 hours.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
