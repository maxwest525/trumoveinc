import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle, MailX } from "lucide-react";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Verifying...</p>
            </>
          )}

          {status === "valid" && (
            <>
              <MailX className="w-10 h-10 mx-auto text-primary" />
              <h1 className="text-xl font-bold">Unsubscribe</h1>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to unsubscribe from TruMove emails?
              </p>
              <Button onClick={handleUnsubscribe} disabled={processing} className="w-full">
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Unsubscribe
              </Button>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />
              <h1 className="text-xl font-bold">Unsubscribed</h1>
              <p className="text-sm text-muted-foreground">
                You've been unsubscribed from TruMove emails. You won't receive any more messages from us.
              </p>
            </>
          )}

          {status === "already" && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground" />
              <h1 className="text-xl font-bold">Already Unsubscribed</h1>
              <p className="text-sm text-muted-foreground">
                You're already unsubscribed from TruMove emails.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
              <h1 className="text-xl font-bold">Invalid Link</h1>
              <p className="text-sm text-muted-foreground">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive" />
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                We couldn't process your request. Please try again later.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
