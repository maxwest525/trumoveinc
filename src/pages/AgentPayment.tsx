import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Send, Loader2, CheckCircle2, DollarSign,
  Receipt, Mail, FileText, Lock, ArrowRight, Shield,
  Building2, Banknote, Copy, RefreshCw, User
} from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "card" | "ach";
type PaymentMode = "charge" | "invoice";

export default function AgentPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";
  const leadId = searchParams.get("leadId") || "";

  const [mode, setMode] = useState<PaymentMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [form, setForm] = useState({
    customerName: prefillName,
    customerEmail: prefillEmail,
    amount: "",
    description: "Moving services",
    cardNumber: "", cardExpiry: "", cardCvc: "", cardName: "",
    routingNumber: "", accountNumber: "", accountName: "",
  });

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleChargeNow = async () => {
    if (!form.amount) { toast.error("Please enter an amount"); return; }
    if (!form.customerName) { toast.error("Please enter customer name"); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Payment processed successfully", {
      description: `$${Number(form.amount).toLocaleString()} charged to ${form.customerName}`,
    });
  };

  const handleSendInvoice = async () => {
    if (!form.amount) { toast.error("Please enter an amount"); return; }
    if (!form.customerEmail) { toast.error("Please enter customer email for invoice"); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Invoice sent successfully", {
      description: `$${Number(form.amount).toLocaleString()} invoice sent to ${form.customerEmail}`,
    });
  };

  const goToCustomers = () => navigate(leadId ? `/agent/customers/${leadId}` : "/agent/customers");

  const receiptNumber = `INV-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`;

  const workflowSteps = ["New Customer", "E-Sign", "Payment", "My Customers"];
  const activeStepIndex = 2;

  const initials = form.customerName
    ? form.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <AgentShell breadcrumbs={[
      { label: "My Customers", href: "/agent/customers" },
      ...(leadId ? [{ label: prefillName || "Customer", href: `/agent/customers/${leadId}` }] : []),
      { label: "Payment" },
    ]}>
      <div className="p-6 max-w-xl mx-auto space-y-5">

        {/* ── Workflow stepper ── */}
        <div className="flex items-center justify-between px-2">
          {workflowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-0">
              {i > 0 && (
                <div className={`w-12 h-px mx-1 ${i <= activeStepIndex ? "bg-primary/40" : "bg-border"}`} />
              )}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  i === activeStepIndex
                    ? "bg-primary text-primary-foreground"
                    : i < activeStepIndex
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {i < activeStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${
                  i === activeStepIndex ? "text-primary" : i < activeStepIndex ? "text-foreground" : "text-muted-foreground"
                }`}>{step}</span>
              </div>
            </div>
          ))}
        </div>

        {isComplete ? (
          /* ═══════════ SUCCESS ═══════════ */
          <div className="space-y-5">
            {/* Success hero */}
            <div className="rounded-2xl bg-gradient-to-b from-primary/8 to-transparent border border-primary/10 p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-bold">
                {mode === "charge" ? "Payment Successful" : "Invoice Sent"}
              </p>
              <p className="text-3xl font-black tracking-tight">
                ${Number(form.amount).toLocaleString()}
              </p>
              <Badge variant="outline" className="text-[11px] gap-1.5 font-mono">
                <FileText className="w-3 h-3" />{receiptNumber}
              </Badge>
            </div>

            {/* Receipt details */}
            <div className="rounded-xl bg-muted/40 p-5 space-y-2.5 text-sm">
              <Row label="Customer" value={form.customerName} />
              {form.customerEmail && <Row label="Email" value={form.customerEmail} />}
              <Row label="Method" value={mode === "charge" ? paymentMethod.toUpperCase() : "Invoice"} />
              <Row label="Description" value={form.description} />
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${Number(form.amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {mode === "invoice" && (
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-10" onClick={() => {
                  toast.success("Payment link resent", { description: `Sent to ${form.customerEmail}` });
                }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Link
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-10" onClick={() => {
                navigator.clipboard.writeText(receiptNumber);
                toast.success("Receipt number copied");
              }}>
                <Copy className="w-3.5 h-3.5" /> Copy Receipt
              </Button>
            </div>

            <Button className="w-full gap-2 h-12 text-sm font-semibold" onClick={goToCustomers}>
              Continue to My Customers <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : !mode ? (
          /* ═══════════ INITIAL: info + method ═══════════ */
          <div className="space-y-5">

            {/* Customer identity strip */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{form.customerName || "New Customer"}</p>
                <p className="text-xs text-muted-foreground truncate">{form.customerEmail || "No email on file"}</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer Name">
                  <Input value={form.customerName} onChange={e => updateField("customerName", e.target.value)} placeholder="John Smith" />
                </Field>
                <Field label="Customer Email">
                  <Input type="email" value={form.customerEmail} onChange={e => updateField("customerEmail", e.target.value)} placeholder="john@email.com" />
                </Field>
              </div>

              <Field label="Amount">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">$</span>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => updateField("amount", e.target.value)}
                    placeholder="0.00"
                    className="pl-8 text-2xl font-black h-14 tracking-tight"
                  />
                </div>
              </Field>

              <Field label="Description">
                <Input value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Moving services" />
              </Field>
            </div>

            <Separator />

            {/* Method selection */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose payment method</p>
              <div className="grid grid-cols-2 gap-3">
                <MethodCard
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Charge Now"
                  subtitle="Process card/ACH"
                  onClick={() => form.amount ? setMode("charge") : toast.error("Enter an amount first")}
                />
                <MethodCard
                  icon={<Receipt className="w-5 h-5" />}
                  title="Send Invoice"
                  subtitle="Email payment link"
                  onClick={() => form.amount ? setMode("invoice") : toast.error("Enter an amount first")}
                />
              </div>
            </div>

            <button
              onClick={goToCustomers}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Skip &mdash; collect payment later
            </button>
          </div>
        ) : mode === "charge" ? (
          /* ═══════════ CHARGE NOW ═══════════ */
          <div className="space-y-5">

            {/* Amount bar */}
            <div className="rounded-xl bg-foreground text-background p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-60 font-medium">Charging</p>
                  <p className="text-2xl font-black tracking-tight mt-0.5">
                    ${Number(form.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">{form.customerName}</p>
                  <p className="text-[11px] opacity-40 mt-0.5">{form.description}</p>
                </div>
              </div>
            </div>

            {/* Method toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-muted/60">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === "card"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                onClick={() => setPaymentMethod("ach")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === "ach"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4" /> Bank (ACH)
              </button>
            </div>

            {/* Card / ACH fields */}
            {paymentMethod === "card" ? (
              <div className="space-y-3">
                <Field label="Name on Card">
                  <Input value={form.cardName} onChange={e => updateField("cardName", e.target.value)} placeholder="John Smith" />
                </Field>
                <Field label="Card Number">
                  <div className="relative">
                    <Input
                      value={form.cardNumber}
                      onChange={e => updateField("cardNumber", formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="pr-10 font-mono tracking-wider"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry">
                    <Input
                      value={form.cardExpiry}
                      onChange={e => updateField("cardExpiry", formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="CVC">
                    <Input
                      value={form.cardCvc}
                      onChange={e => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="font-mono"
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Account Holder Name">
                  <Input value={form.accountName} onChange={e => updateField("accountName", e.target.value)} placeholder="John Smith" />
                </Field>
                <Field label="Routing Number">
                  <Input
                    value={form.routingNumber}
                    onChange={e => updateField("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="021000021"
                    maxLength={9}
                    className="font-mono tracking-wider"
                  />
                </Field>
                <Field label="Account Number">
                  <div className="relative">
                    <Input
                      value={form.accountNumber}
                      onChange={e => updateField("accountNumber", e.target.value.replace(/\D/g, ""))}
                      placeholder="000123456789"
                      className="font-mono tracking-wider"
                    />
                    <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                </Field>
              </div>
            )}

            {/* Security badges */}
            <div className="flex items-center justify-center gap-5 py-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="w-3 h-3" /> SSL Encrypted
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Shield className="w-3 h-3" /> PCI Compliant
              </span>
            </div>

            {/* CTA */}
            <Button className="w-full gap-2 h-12 text-sm font-semibold" onClick={handleChargeNow} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Lock className="w-4 h-4" /> Charge ${Number(form.amount || 0).toLocaleString()}</>
              )}
            </Button>

            <button
              onClick={() => setMode(null)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              &larr; Back to payment options
            </button>
          </div>
        ) : (
          /* ═══════════ SEND INVOICE ═══════════ */
          <div className="space-y-5">

            {/* Amount bar */}
            <div className="rounded-xl bg-foreground text-background p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-60 font-medium">Invoice</p>
                  <p className="text-2xl font-black tracking-tight mt-0.5">
                    ${Number(form.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">{form.customerName}</p>
                  <p className="text-[11px] opacity-40 mt-0.5">{form.description}</p>
                </div>
              </div>
            </div>

            {/* Invoice preview */}
            <div className="rounded-xl bg-muted/40 p-5 space-y-2.5 text-sm">
              <Row label="To" value={form.customerName || "\u2014"} />
              <Row label="Email" value={form.customerEmail || "\u2014"} />
              <Row label="Description" value={form.description} />
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Total Due</span>
                <span>${Number(form.amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2.5">
              <Mail className="w-3.5 h-3.5 shrink-0 text-primary/60" />
              <span>Customer will receive an email with a secure payment link</span>
            </div>

            <Button className="w-full gap-2 h-12 text-sm font-semibold" onClick={handleSendInvoice} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Invoice</>
              )}
            </Button>

            <button
              onClick={() => setMode(null)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              &larr; Back to payment options
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/60 pt-2">
          Payments are securely processed through Stripe. Financial data is never stored on our servers.
        </p>
      </div>
    </AgentShell>
  );
}

/* ── Helper components ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function MethodCard({ icon, title, subtitle, onClick }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl border border-border bg-background p-5 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/8 text-primary flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-colors">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </button>
  );
}
