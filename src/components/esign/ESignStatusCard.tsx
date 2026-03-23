import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Mail, 
  Eye, 
  Download, 
  FileText, 
  Send,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ESignStatusCardProps {
  documentTitle: string;
  recipientEmail?: string;
  recipientName?: string;
  isSigned: boolean;
  refNumber: string;
  onPreview?: () => void;
  onDownload?: () => void;
  className?: string;
}

type DeliveryStatus = "pending" | "sent" | "delivered" | "opened" | "signed";

export function ESignStatusCard({
  documentTitle,
  recipientEmail,
  recipientName,
  isSigned,
  refNumber,
  onPreview,
  onDownload,
  className,
}: ESignStatusCardProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("pending");
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const [deliveredAt, setDeliveredAt] = useState<Date | null>(null);
  const [openedAt, setOpenedAt] = useState<Date | null>(null);
  const [signedAt, setSignedAt] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Simulate delivery progression when email is provided
  useEffect(() => {
    if (recipientEmail && deliveryStatus === "pending") {
      // Simulate sending
      const sendTimer = setTimeout(() => {
        setSentAt(new Date());
        setDeliveryStatus("sent");
      }, 1000);

      return () => clearTimeout(sendTimer);
    }
  }, [recipientEmail, deliveryStatus]);

  useEffect(() => {
    if (deliveryStatus === "sent") {
      // Simulate delivery confirmation
      const deliverTimer = setTimeout(() => {
        setDeliveredAt(new Date());
        setDeliveryStatus("delivered");
      }, 2000);

      return () => clearTimeout(deliverTimer);
    }
  }, [deliveryStatus]);

  useEffect(() => {
    if (deliveryStatus === "delivered") {
      // Simulate document opened
      const openTimer = setTimeout(() => {
        setOpenedAt(new Date());
        setDeliveryStatus("opened");
      }, 3000);

      return () => clearTimeout(openTimer);
    }
  }, [deliveryStatus]);

  // Update signed status when document is fully signed
  useEffect(() => {
    if (isSigned && deliveryStatus === "opened") {
      setSignedAt(new Date());
      setDeliveryStatus("signed");
    }
  }, [isSigned, deliveryStatus]);

  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else {
      toast.info("Opening document preview...");
      // Default: scroll to top of document
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload();
      } else {
        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`${documentTitle} downloaded as PDF`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const statusItems = [
    {
      key: "sent",
      label: "Sent to Customer",
      icon: Send,
      time: sentAt,
      active: deliveryStatus !== "pending",
    },
    {
      key: "delivered",
      label: "Customer Received",
      icon: Mail,
      time: deliveredAt,
      active: ["delivered", "opened", "signed"].includes(deliveryStatus),
    },
    {
      key: "opened",
      label: "Customer Opened",
      icon: Eye,
      time: openedAt,
      active: ["opened", "signed"].includes(deliveryStatus),
    },
    {
      key: "signed",
      label: "Customer Signed ✓",
      icon: CheckCircle2,
      time: signedAt,
      active: deliveryStatus === "signed",
    },
  ];

  return (
    <Card className={cn("border border-border bg-background shadow-sm", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Customer E-Sign Status
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">{refNumber}</span>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          {statusItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === statusItems.length - 1;
            
            return (
              <div key={item.key} className="flex items-start gap-2.5">
                {/* Status Icon */}
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  item.active 
                    ? item.key === "signed" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-foreground text-background"
                    : "border border-muted-foreground/30 bg-muted/20"
                )}>
                  {item.active ? (
                    <Icon className="w-2.5 h-2.5" />
                  ) : (
                    <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                  )}
                </div>

                {/* Status Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-xs",
                      item.active ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-[10px] font-mono",
                      item.active ? "text-foreground/70" : "text-muted-foreground/50"
                    )}>
                      {item.time ? formatTime(item.time) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recipient Info */}
        {recipientEmail && (
          <div className="pt-2 border-t border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Recipient</div>
            <div className="text-xs text-foreground truncate">
              {recipientName || recipientEmail}
            </div>
            {recipientName && (
              <div className="text-[10px] text-muted-foreground truncate">{recipientEmail}</div>
            )}
          </div>
        )}

        {/* Action Buttons — agent only */}
        {!isPublic && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 gap-1.5 text-xs"
              onClick={handlePreview}
            >
              <Eye className="w-3 h-3" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 h-8 gap-1.5 text-xs",
                isSigned && "border-foreground/20 hover:bg-foreground hover:text-background"
              )}
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {isDownloading ? "..." : "Download PDF"}
            </Button>
          </div>
        )}

        {/* Signed Success Message */}
        {isSigned && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-foreground text-background border border-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs font-medium">
              Customer has signed — ready for download
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
