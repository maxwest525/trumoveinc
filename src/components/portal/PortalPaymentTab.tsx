import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Lock, CheckCircle2, DollarSign, Shield,
  Loader2, Building2, Banknote
} from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "card" | "ach";

interface PortalPaymentTabProps {
  dealValue?: number | null;
  customerName?: string;
  moveDate?: string | null;
  dealStage?: string | null;
}

export function PortalPaymentTab({ dealValue, customerName, moveDate, dealStage }: PortalPaymentTabProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [form, setForm] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    routingNumber: "",
    accountNumber: "",
    accountName: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // Deposit amount (e.g. 30% of deal value, or full amount)
  const depositAmount = dealValue ? Math.round(dealValue * 0.3) : null;
  const displayAmount = depositAmount ?? dealValue ?? 0;

  const handleSubmitPayment = async () => {
    if (paymentMethod === "card") {
      if (!form.cardNumber || !form.cardExpiry || !form.cardCvc || !form.cardName) {
        toast.error("Please fill in all card details");
        return;
      }
    } else {
      if (!form.routingNumber || !form.accountNumber || !form.accountName) {
        toast.error("Please fill in all bank details");
        return;
      }
    }

    setIsProcessing(true);
    // Placeholder: will be replaced with Stripe payment intent
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success("Payment submitted successfully");
  };

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Payment</h2>
          <p className="text-sm text-muted-foreground">Make a secure payment for your move.</p>
        </div>
        <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Payment Received</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${displayAmount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Thank you, {customerName}. Your deposit has been processed.
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1.5">
            <Shield className="w-3 h-3" />
            Processed securely via Stripe
          </Badge>
          <Separator />
          <p className="text-xs text-muted-foreground">
            A receipt has been sent to your email. Contact your moving agent if you have any questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Payment</h2>
        <p className="text-sm text-muted-foreground">Make a secure payment for your move.</p>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        {/* Amount summary card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-foreground text-background px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-70">Deposit Due</p>
                <p className="text-2xl font-bold mt-0.5">
                  ${displayAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            {dealValue && depositAmount && (
              <p className="text-xs opacity-60 mt-2">
                30% deposit of ${dealValue.toLocaleString()} total
              </p>
            )}
          </div>

          <div className="px-5 py-3 space-y-2">
            {customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium text-foreground">{customerName}</span>
              </div>
            )}
            {moveDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Move Date</span>
                <span className="font-medium text-foreground">
                  {new Date(moveDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {dealStage && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {dealStage.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Payment method selector */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              onClick={() => setPaymentMethod("ach")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                paymentMethod === "ach"
                  ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Bank (ACH)
            </button>
          </div>

          <Separator />

          {/* Card form */}
          {paymentMethod === "card" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name on Card</Label>
                <Input
                  value={form.cardName}
                  onChange={(e) => updateField("cardName", e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Card Number</Label>
                <div className="relative">
                  <Input
                    value={form.cardNumber}
                    onChange={(e) => updateField("cardNumber", formatCardNumber(e.target.value))}
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
                    onChange={(e) => updateField("cardExpiry", formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">CVC</Label>
                  <Input
                    value={form.cardCvc}
                    onChange={(e) => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
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
                  onChange={(e) => updateField("accountName", e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Routing Number</Label>
                <Input
                  value={form.routingNumber}
                  onChange={(e) => updateField("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="021000021"
                  maxLength={9}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Account Number</Label>
                <div className="relative">
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => updateField("accountNumber", e.target.value.replace(/\D/g, ""))}
                    placeholder="000123456789"
                  />
                  <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2 h-12 text-sm font-semibold"
            onClick={handleSubmitPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${displayAmount.toLocaleString()}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground px-4">
          Payments are securely processed through Stripe. Your financial data is never stored on our servers.
        </p>
      </div>
    </div>
  );
}
