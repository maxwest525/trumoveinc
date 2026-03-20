import { useState, useEffect } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Globe, ArrowRight, Check, Copy, ExternalLink,
  AlertTriangle, RefreshCw, Shield, Server,
} from "lucide-react";

const DNS_IP = "185.158.133.1";

interface DomainConfig {
  customerDomain: string;
  crmDomain: string;
}

function loadConfig(): DomainConfig {
  try {
    const raw = localStorage.getItem("trumove_domain_config");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { customerDomain: "", crmDomain: "" };
}

function saveConfig(cfg: DomainConfig) {
  localStorage.setItem("trumove_domain_config", JSON.stringify(cfg));
}

function DnsRecord({ type, name, value }: { type: string; name: string; value: string }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono">
      <Badge variant="outline" className="text-[10px] shrink-0">{type}</Badge>
      <span className="text-muted-foreground w-16 shrink-0">{name}</span>
      <span className="flex-1 truncate text-foreground">{value}</span>
      <button onClick={copy} className="p-1 rounded hover:bg-muted transition-colors shrink-0">
        <Copy className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

function DomainCard({
  label,
  description,
  icon: Icon,
  domain,
  onChange,
  accentClass,
}: {
  label: string;
  description: string;
  icon: typeof Globe;
  domain: string;
  onChange: (v: string) => void;
  accentClass: string;
}) {
  const hasDomain = domain.trim().length > 0;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accentClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Domain
        </label>
        <Input
          placeholder="e.g. trumoveinc.com"
          value={domain}
          onChange={(e) => onChange(e.target.value.toLowerCase().trim())}
          className="h-9 text-sm font-mono"
        />
      </div>

      {hasDomain && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Required DNS Records
          </p>
          <DnsRecord type="A" name="@" value={DNS_IP} />
          <DnsRecord type="A" name="www" value={DNS_IP} />
          <DnsRecord type="TXT" name="_lovable" value={`lovable_verify=${domain.replace(/\./g, "_")}`} />
        </div>
      )}
    </Card>
  );
}

export default function AdminDomains() {
  const [config, setConfig] = useState<DomainConfig>(loadConfig);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const current = loadConfig();
    const changed =
      current.customerDomain !== config.customerDomain ||
      current.crmDomain !== config.crmDomain;
    setSaved(!changed);
  }, [config]);

  const handleSave = () => {
    if (!config.customerDomain && !config.crmDomain) {
      toast.error("Enter at least one domain");
      return;
    }
    if (
      config.customerDomain &&
      config.crmDomain &&
      config.customerDomain === config.crmDomain
    ) {
      toast.error("Domains must be different");
      return;
    }
    saveConfig(config);
    setSaved(true);
    toast.success("Domain configuration saved");
  };

  return (
    <AdminShell breadcrumb=" › Domains">
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">Domain Routing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your purchased domains to the customer-facing site and the employee CRM.
            Each domain shows its own experience — no login wall on the public site, auth-gated on the CRM.
          </p>
        </div>

        {/* How it works */}
        <Card className="p-4 bg-muted/30 border-dashed">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground text-sm">How it works</p>
              <p>
                Both domains point to this same app. When a visitor arrives, the system checks the
                hostname and routes them to the correct experience automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1.5 border">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span className="font-mono text-[11px]">trumoveinc.com</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[11px]">Customer Site</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1.5 border">
                  <Server className="w-3 h-3 text-blue-500" />
                  <span className="font-mono text-[11px]">crm.trumoveinc.com</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-[11px]">Employee CRM</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Domain cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <DomainCard
            label="Customer-Facing Site"
            description="Public website visitors see — quotes, trust content, booking"
            icon={Globe}
            domain={config.customerDomain}
            onChange={(v) => setConfig((p) => ({ ...p, customerDomain: v }))}
            accentClass="bg-emerald-500/10 text-emerald-600"
          />
          <DomainCard
            label="Employee CRM"
            description="Auth-gated portal for agents, managers, and admins"
            icon={Server}
            domain={config.crmDomain}
            onChange={(v) => setConfig((p) => ({ ...p, crmDomain: v }))}
            accentClass="bg-blue-500/10 text-blue-600"
          />
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Configuration saved</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
          <Button size="sm" onClick={handleSave} disabled={saved} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Save Configuration
          </Button>
        </div>

        {/* Setup steps */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Setup Checklist</h3>
          <ol className="space-y-3 text-xs text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-foreground font-medium">Enter your domains above</p>
                <p>Type the domains you've purchased for your customer site and CRM.</p>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-foreground font-medium">Add DNS records at your registrar</p>
                <p>Add the A records and TXT verification record shown above for each domain at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc).</p>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-foreground font-medium">Connect domains in Lovable</p>
                <p>Go to your Lovable project Settings → Domains → Connect Domain. Add <strong>both</strong> domains. DNS propagation can take up to 72 hours.</p>
              </div>
            </li>
            <li className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              <div>
                <p className="text-foreground font-medium">Publish your project</p>
                <p>Once DNS is verified and SSL is issued, publish. The app auto-detects which domain the visitor is on and shows the right experience.</p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Current detection info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Current hostname</p>
              <p className="text-sm font-mono text-foreground mt-0.5">{window.location.hostname}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {window.location.hostname.startsWith("crm.") ? "CRM Mode" :
               window.location.hostname === "localhost" || window.location.hostname.endsWith(".lovable.app") ? "Dev / Preview (CRM)" :
               "Customer Site Mode"}
            </Badge>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
