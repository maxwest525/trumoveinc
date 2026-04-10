import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AgentShell from "@/components/layout/AgentShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Workflow breadcrumb steps
  const workflowSteps = [
    "New Customer",
    "E-Sign",
    "Payment",
    "My Customers",
  ];
  const activeStepIndex = 2;

  return (
    <AgentShell breadcrumbs={[
      { label: "My Customers", href: "/agent/customers" },
      ...(leadId ? [{ label: prefillName || "Customer", href: `/agent/customers/${leadId}` }] : []),
      { label: "Payment" },
    ]}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {workflowSteps.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="w-3 h-3" />}
              <span className={i === activeStepIndex ? "text-primary font-semibold" : ""}>
                {step}
              </span>
            </span>
          ))}
        </div>

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Collect Payment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Charge or invoice your customer
          </p>
        </div>

        {isComplete ? (
          /* ========== SUCCESS STATE ========== */
          <Card>
            <CardContent className="p-0">
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
                <Badge variant="outline" className="text-xs gap-1.5">
                  <FileText className="w-3 h-3" />{receiptNumber}
                </Badge>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{form.customerName}</span>
                </div>
                {form.customerEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{form.customerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">
                    {mode === "charge" ? paymentMethod.toUpperCase() : "Invoice"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{form.description}</span>
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
            </CardContent>
          </Card>
        ) : !mode ? (
          /* ========== INITIAL STATE: Customer info + method selection ========== */
          <>
            {/* Customer info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{form.customerName || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">
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

                <div className="space-y-1.5 mt-3">
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={e => updateField("amount", e.target.value)}
                      placeholder="0.00"
                      className="pl-9 text-lg font-bold h-12"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mt-3">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input
                    value={form.description}
                    onChange={e => updateField("description", e.target.value)}
                    placeholder="Moving services"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment method selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choose payment method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => form.amount ? setMode("charge") : toast.error("Enter an amount first")}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Charge Now</p>
                      <p className="text-xs text-muted-foreground">Process card/ACH</p>
                    </div>
                  </button>

                  <button
                    onClick={() => form.amount ? setMode("invoice") : toast.error("Enter an amount first")}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Send Invoice</p>
                      <p className="text-xs text-muted-foreground">Email payment link</p>
                    </div>
                  </button>
                </div>

                <button
                  onClick={goToCustomers}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Skip &mdash; collect payment later
                </button>
              </CardContent>
            </Card>
          </>
        ) : mode === "charge" ? (
          /* ========== CHARGE NOW STATE ========== */
          <>
            {/* Amount summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Charging {form.customerName}</p>
                      <p className="text-xl font-bold">${Number(form.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{form.description}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment method toggle + form */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Payment Method
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="w-4 h-4" /> Card
                  </Button>
                  <Button
                    variant={paymentMethod === "ach" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setPaymentMethod("ach")}
                  >
                    <Building2 className="w-4 h-4" /> Bank (ACH)
                  </Button>
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
              </CardContent>
            </Card>

            {/* Security + action */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL Encrypted</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> PCI Compliant</span>
            </div>

            <Button className="w-full gap-2 h-12 text-base" onClick={handleChargeNow} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><Lock className="w-5 h-5" /> Charge ${Number(form.amount || 0).toLocaleString()}</>
              )}
            </Button>

            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setMode(null)}>
              &larr; Back to payment options
            </Button>
          </>
        ) : (
          /* ========== SEND INVOICE STATE ========== */
          <>
            {/* Amount summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Invoice for {form.customerName}</p>
                      <p className="text-xl font-bold">${Number(form.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{form.description}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Invoice preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">{form.customerName || "\u2014"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{form.customerEmail || "\u2014"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{form.description}</span>
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
              </CardContent>
            </Card>

            <Button className="w-full gap-2 h-12 text-base" onClick={handleSendInvoice} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-5 h-5" /> Send Invoice</>
              )}
            </Button>

            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setMode(null)}>
              &larr; Back to payment options
            </Button>
          </>
        )}

        {/* Continue to customers (success state) */}
        {isComplete && (
          <Button className="w-full gap-2 h-12 text-base" onClick={goToCustomers}>
            Continue to My Customers <ArrowRight className="w-5 h-5" />
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Payments are securely processed through Stripe. Financial data is never stored on our servers.
        </p>
      </div>
    </AgentShell>
  );
}
