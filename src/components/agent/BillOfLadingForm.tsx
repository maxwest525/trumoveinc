import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Receipt, Truck, MapPin, Package, Calendar, FileText, Sparkles, Printer, Download, UserPlus, History, ArrowRight, CircleDot, Shield } from "lucide-react";
import { toast } from "sonner";
import { ClientSearchModal, type ClientData } from "./ClientSearchModal";
import { CarrierSearchModal, type CarrierMoveData } from "./CarrierSearchModal";

export function BillOfLadingForm() {
  const [formData, setFormData] = useState({
    bolNumber: "",
    bookingRef: "",
    moveDate: "",
    originName: "",
    originAddress: "",
    originPhone: "",
    destName: "",
    destAddress: "",
    destPhone: "",
    carrierName: "",
    carrierMC: "",
    carrierDOT: "",
    driverName: "",
    truckNumber: "",
    weight: "",
    pieces: "",
    specialInstructions: "",
  });

  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showCarrierSearch, setShowCarrierSearch] = useState(false);
  const [importTarget, setImportTarget] = useState<"origin" | "dest">("origin");

  const fillDemo = () => {
    setFormData({
      bolNumber: "BOL-2026-004821",
      bookingRef: "TM-2026-1847",
      moveDate: "2026-04-15",
      originName: "Jane Smith",
      originAddress: "742 Evergreen Terrace, Springfield, IL 62704",
      originPhone: "(217) 555-0142",
      destName: "Jane Smith",
      destAddress: "1600 Pennsylvania Ave, Washington, DC 20500",
      destPhone: "(202) 555-0198",
      carrierName: "Elite Moving Co.",
      carrierMC: "MC-891204",
      carrierDOT: "3284019",
      driverName: "Michael Torres",
      truckNumber: "TRK-4821",
      weight: "8,500",
      pieces: "142",
      specialInstructions: "Fragile items in master bedroom. Piano requires special handling.",
    });
    toast.success("Demo data loaded");
  };

  const handlePrint = () => toast.success("Preparing document for print...");
  const handleDownload = () => toast.success("Downloading BOL as PDF...");

  const openClientSearch = (target: "origin" | "dest") => {
    setImportTarget(target);
    setShowClientSearch(true);
  };

  const handleClientSelect = (client: ClientData) => {
    if (importTarget === "origin") {
      setFormData(prev => ({ ...prev, originName: client.name, originAddress: client.address, originPhone: client.phone }));
    } else {
      setFormData(prev => ({ ...prev, destName: client.name, destAddress: client.address, destPhone: client.phone }));
    }
  };

  const handleCarrierSelect = (carrier: CarrierMoveData) => {
    setFormData(prev => ({
      ...prev,
      carrierName: carrier.carrierName,
      carrierMC: carrier.carrierMC,
      carrierDOT: carrier.dotNumber || "",
      driverName: carrier.driverName,
      truckNumber: carrier.truckNumber,
    }));
    toast.success(`Imported carrier: ${carrier.carrierName}`);
  };

  const filledFields = Object.values(formData).filter(Boolean).length;
  const totalFields = Object.keys(formData).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="space-y-0">
      <ClientSearchModal open={showClientSearch} onClose={() => setShowClientSearch(false)} onSelect={handleClientSelect} />
      <CarrierSearchModal open={showCarrierSearch} onClose={() => setShowCarrierSearch(false)} onSelect={handleCarrierSelect} />

      {/* Premium Header */}
      <div className="bg-foreground text-background rounded-t-xl px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Merchant Payment</h2>
              <p className="text-sm text-muted-foreground/60 mt-0.5">Bill of Lading & Payment Authorization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fillDemo} variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground/60 hover:text-background hover:bg-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Demo
            </Button>
            <Button onClick={handlePrint} variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground/60 hover:text-background hover:bg-white/10">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button onClick={handleDownload} size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground/50 tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Form Body */}
      <div className="bg-card rounded-b-xl border border-t-0 border-border/50">

        {/* Document Info Strip */}
        <div className="px-8 py-5 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Document Details</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">BOL Number</Label>
              <Input
                value={formData.bolNumber}
                onChange={(e) => setFormData({ ...formData, bolNumber: e.target.value })}
                placeholder="BOL-YYYY-XXXXXX"
                className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Booking Reference</Label>
              <Input
                value={formData.bookingRef}
                onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                placeholder="TM-XXXXXXXX"
                className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Move Date
              </Label>
              <Input
                type="date"
                value={formData.moveDate}
                onChange={(e) => setFormData({ ...formData, moveDate: e.target.value })}
                className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Origin → Destination */}
        <div className="px-8 py-6 border-b border-border/50">
          <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-6 items-start">
            {/* Origin */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CircleDot className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Origin</span>
                  <Badge variant="outline" className="text-[10px] font-normal">Shipper</Badge>
                </div>
                <Button onClick={() => openClientSearch("origin")} variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground hover:text-primary">
                  <UserPlus className="w-3 h-3" />
                  Import
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input value={formData.originName} onChange={(e) => setFormData({ ...formData, originName: e.target.value })} placeholder="Shipper name" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input value={formData.originAddress} onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })} placeholder="Full pickup address" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input value={formData.originPhone} onChange={(e) => setFormData({ ...formData, originPhone: e.target.value })} placeholder="(555) 123-4567" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex flex-col items-center justify-center pt-12">
              <div className="w-px h-8 bg-border" />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center my-1">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <div className="w-px h-8 bg-border" />
            </div>

            {/* Destination */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-destructive" />
                  </div>
                  <span className="text-sm font-semibold">Destination</span>
                  <Badge variant="outline" className="text-[10px] font-normal">Consignee</Badge>
                </div>
                <Button onClick={() => openClientSearch("dest")} variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground hover:text-primary">
                  <UserPlus className="w-3 h-3" />
                  Import
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input value={formData.destName} onChange={(e) => setFormData({ ...formData, destName: e.target.value })} placeholder="Consignee name" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input value={formData.destAddress} onChange={(e) => setFormData({ ...formData, destAddress: e.target.value })} placeholder="Full delivery address" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input value={formData.destPhone} onChange={(e) => setFormData({ ...formData, destPhone: e.target.value })} placeholder="(555) 123-4567" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carrier + Shipment side by side */}
        <div className="px-8 py-6 border-b border-border/50">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Carrier */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Truck className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-sm font-semibold">Carrier</span>
                </div>
                <Button onClick={() => setShowCarrierSearch(true)} variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground hover:text-primary">
                  <History className="w-3 h-3" />
                  Import
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Carrier Name</Label>
                  <Input value={formData.carrierName} onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })} placeholder="Carrier company" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">MC Number</Label>
                    <Input value={formData.carrierMC} onChange={(e) => setFormData({ ...formData, carrierMC: e.target.value })} placeholder="MC-XXXXXX" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">DOT Number</Label>
                    <Input value={formData.carrierDOT} onChange={(e) => setFormData({ ...formData, carrierDOT: e.target.value })} placeholder="XXXXXXX" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Driver Name</Label>
                    <Input value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} placeholder="Driver full name" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Truck Number</Label>
                    <Input value={formData.truckNumber} onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })} placeholder="TRK-XXXX" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Package className="w-3 h-3 text-amber-500" />
                </div>
                <span className="text-sm font-semibold">Shipment</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Est. Weight (lbs)</Label>
                    <Input value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Total Pieces</Label>
                    <Input value={formData.pieces} onChange={(e) => setFormData({ ...formData, pieces: e.target.value })} placeholder="0" className="h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Special Instructions</Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    placeholder="Any special handling instructions, fragile items, access notes..."
                    rows={4}
                    className="bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 resize-none text-sm"
                  />
                </div>
                {/* Compliance badge */}
                <div className="flex items-center gap-2 pt-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] text-muted-foreground">FMCSA compliant document • Legally binding upon signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Cancel
          </Button>
          <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Receipt className="w-3.5 h-3.5" />
            Generate BOL
          </Button>
        </div>
      </div>
    </div>
  );
}
