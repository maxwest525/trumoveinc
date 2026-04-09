import { useState } from "react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImg from "@/assets/logo.png";

interface ESignVerificationGateProps {
  refNumber: string;
  onVerified: (data: {
    lead: { first_name: string; last_name: string; email: string; phone: string; origin_address: string };
    document: { lead_id: string; document_type: string; status: string; ref_number: string };
  }) => void;
}

export default function ESignVerificationGate({ refNumber, onVerified }: ESignVerificationGateProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const maxAttempts = 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    if (attempts >= maxAttempts) {
      setError("Too many failed attempts. Please contact support.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/get-esign-public`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify",
            ref_number: refNumber,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }),
        }
      );

      const result = await resp.json();

      if (result.verified && result.lead && result.document) {
        onVerified({ lead: result.lead, document: result.document });
      } else {
        setAttempts((a) => a + 1);
        setError(result.error || "Name does not match our records. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoImg} alt="TruMove" className="h-7 mx-auto mb-5" />
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Identity Verification</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            For your security, please confirm your name before accessing your documents.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Reference: <span className="font-mono font-medium text-foreground">{refNumber}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">First Name</label>
            <Input
              type="text"
              required
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 h-11"
              autoFocus
              disabled={attempts >= maxAttempts}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Name</label>
            <Input
              type="text"
              required
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 h-11"
              disabled={attempts >= maxAttempts}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim() || attempts >= maxAttempts}
            className="w-full h-11 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Continue to Documents"
            )}
          </Button>

          {attempts > 0 && attempts < maxAttempts && (
            <p className="text-[10px] text-muted-foreground text-center">
              {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? "s" : ""} remaining
            </p>
          )}
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
          Your name must match the name on file for this document.
          If you're having trouble, please contact us at{" "}
          <a href="tel:+18336931695" className="text-primary underline underline-offset-2">(833) 693-1695</a>.
        </p>
      </div>
    </div>
  );
}
