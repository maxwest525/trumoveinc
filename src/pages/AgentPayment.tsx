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
  Building2, Banknote, Copy, ExternalLink, RefreshCw, User
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
    toast.success("Payment processed successfully", { description: `$${Number(form.amount).toLocaleString()} charged to ${form.customerName}` });
  };

  const handleSendInvoice = async () => {
    if (!form.amount) { toast.error("Please enter an amount"); return; }
    if (!form.customerEmail) { toast.error("Please enter customer email for invoice"); return; }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Invoice sent successfully", { description: `$${Number(form.amount).toLocaleString()} invoice sent to ${form.customerEmail}` });
  };

  const goToCustomers = () => navigate(leadId ? `/agent/customers/${leadId}` : "/agent/customers");

  const receiptNumber = `INV-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`;

  return (
    <AgentShell breadcrumbs={[
      { label: "My Customers", href: "/agent/customers" },
      ...(leadId ? [{ label: prefillName || "Customer", href: `/agent/customers/${leadId}` }] : []),
      { label: "Payment" },
    ]}>
      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* Workflow progress */}
        <div className="flex items-center justify-center gap-0">
          {[
            { label: "New Customer", done: true },
            { label: "E-Sign", done: true },
            { label: "Payment", active: true },
            { label: "My Customers", done: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.active
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    : step.done
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {step.done && !step.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${
                  step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"
                }`}>{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-10 h-0.5 mx-1.5 mb-4 rounded-full ${
                  step.done ? "bg-primary/30" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Collect Payment</h1>
          <p className="text-sm text-muted-foreground mt-1">Charge or invoice your customer</p>
        </div>

        {isComplete ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-primary/5 border-b border-border px-6 py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {mode === "charge" ? "Payment Successful" : "Invoice Sent"}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  ${Number(form.amount).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs gap-1.5 bg-background">
                <FileText className="w-3 h-3" />{receiptNumber}
              </Badge>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-foreground">{form.customerName}</span>
              </div>
              {form.customerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{form.customerEmail}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-foreground capitalize">{mode === "charge" ? paymentMethod.toUpperCase() : "Invoice"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium text-foreground">{form.description}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>${Number(form.amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-border p-4 flex gap-2">
              {mode === "invoice" && (
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => {
                  toast.success("Payment link resent", { description: `Sent to ${form.customerEmail}` });
                }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Link
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => {
                navigator.clipboard.writeText(receiptNumber);
                toast.success("Receipt number copied");
              }}>
                <Copy className="w-3.5 h-3.5" /> Copy Receipt
              </Button>
            </div>

            <div className="border-t border-border p-4">
              <Button className="w-full gap-2" onClick={goToCustomers}>
                Continue to My Customers <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : !mode ? (
          <div className="space-y-4">
            {/* Customer info card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {form.customerName || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {form.customerEmail || "No email"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Customer Name</Label>
                  <Input
                    value={form.customerName}
                    onChange={e => updateField("customerName", e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Customer Email</Label>
                  <Input
                    type="email"
                    value={form.customerEmail}
                    onChange={e => updateField("customerEmail", e.target.value)}
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={e => updateField("amount", e.target.value)}
                    placeholder="0.00"
                    className="pl-9 text-xl font-bold h-12"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input
                  value={form.description}
                  onChange={e => updateField("description", e.target.value)}
                  placeholder="Moving services"
                />
              </div>
            </div>

            {/* Payment method selection */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm font-semibold text-foreground">Choose payment method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => form.amount ? setMode("charge") : toast.error("Enter an amount first")}
                  className="group relative rounded-xl border border-border bg-background p-5 text-center space-y-2.5 transition-all hover:border-primary/40 hover:shadow-[0_0_16px_hsl(var(--primary)/0.08)] disabled:opacity-50"
                >
                  <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                    <CreditCard className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Charge Now</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Process card/ACH</p>
                  </div>
                </button>

                <button
                  onClick={() => form.amount ? setMode("invoice") : toast.error("Enter an amount first")}
                  className="group relative rounded-xl border border-border bg-background p-5 text-center space-y-2.5 transition-all hover:border-primary/40 hover:shadow-[0_0_16px_hsl(var(--primary)/0.08)] disabled:opacity-50"
                >
                  <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                    <Receipt className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Send Invoice</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Email payment link</p>
                  </div>
                </button>
              </div>

              <button
                onClick={goToCustomers}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip — collect payment later
              </button>
            </div>
          </div>
        ) : mode === "charge" ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Amount header */}
            <div className="bg-foreground text-background px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-70">Charging {form.customerName}</p>
                  <p className="text-2xl font-bold mt-0.5">${Number(form.amount || 0).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Method toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
                <button
                  onClick={() => setPaymentMethod("ach")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === "ach"
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Bank (ACH)
                </button>
              </div>

              <Separator />

              {paymentMethod === "card" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Name on Card</Label>
                    <Input
                      value={form.cardName}
                      onChange={e => updateField("cardName", e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Card Number</Label>
                    <div className="relative">
                      <Input
                        value={form.cardNumber}
                        onChange={e => updateField("cardNumber", formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="pr-10"
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Expiry</Label>
                      <Input
                        value={form.cardExpiry}
                        onChange={e => updateField("cardExpiry", formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">CVC</Label>
                      <Input
                        value={form.cardCvc}
                        onChange={e => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Account Holder Name</Label>
                    <Input
                      value={form.accountName}
                      onChange={e => updateField("accountName", e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Routing Number</Label>
                    <Input
                      value={form.routingNumber}
                      onChange={e => updateField("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="021000021"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Account Number</Label>
                    <div className="relative">
                      <Input
                        value={form.accountNumber}
                        onChange={e => updateField("accountNumber", e.target.value.replace(/\D/g, ""))}
                        placeholder="000123456789"
                      />
                      <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full gap-2 h-11" onClick={handleChargeNow} disabled={isProcessing}>
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Charge ${Number(form.amount || 0).toLocaleString()}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="w-3 h-3" /><span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Shield className="w-3 h-3" /><span>PCI Compliant</span>
                </div>
              </div>

              <Separator />

              <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setMode(null)}>
                ← Back to payment options
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Amount header */}
            <div className="bg-foreground text-background px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-70">Invoice for {form.customerName}</p>
                  <p className="text-2xl font-bold mt-0.5">${Number(form.amount || 0).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Invoice preview */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground">{form.customerName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{form.customerEmail || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-foreground">{form.description}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold">
                  <span>Total Due</span>
                  <span>${Number(form.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>Customer will receive an email with a secure payment link</span>
              </div>

              <Button className="w-full gap-2 h-11" onClick={handleSendInvoice} disabled={isProcessing}>
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Invoice</>
                )}
              </Button>

              <Separator />

              <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setMode(null)}>
                ← Back to payment options
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          Payments are securely processed through Stripe. Financial data is never stored on our servers.
        </p>
      </div>
    </AgentShell>
  );
}
