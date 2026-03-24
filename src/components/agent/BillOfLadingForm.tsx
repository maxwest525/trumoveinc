import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Truck, MapPin, Package, Calendar, FileText, Sparkles, Printer, Download, UserPlus, History, Eye } from "lucide-react";
import { toast } from "sonner";
import { ClientSearchModal, type ClientData } from "./ClientSearchModal";
import { CarrierSearchModal, type CarrierMoveData } from "./CarrierSearchModal";
import { ESignStatusCard } from "@/components/esign/ESignStatusCard";

const DEMO_DATA = {
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
};

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
    setFormData(DEMO_DATA);
    toast.success("Demo data loaded");
  };

  const handlePrint = () => {
    toast.success("Preparing document for print...");
  };

  const handleDownload = () => {
    toast.success("Downloading BOL as PDF...");
  };

  const openClientSearch = (target: "origin" | "dest") => {
    setImportTarget(target);
    setShowClientSearch(true);
  };

  const handleClientSelect = (client: ClientData) => {
    if (importTarget === "origin") {
      setFormData(prev => ({
        ...prev,
        originName: client.name,
        originAddress: client.address,
        originPhone: client.phone,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        destName: client.name,
        destAddress: client.address,
        destPhone: client.phone,
      }));
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

  return (
    <div className="space-y-6">
      <ClientSearchModal
        open={showClientSearch}
        onClose={() => setShowClientSearch(false)}
        onSelect={handleClientSelect}
      />
      <CarrierSearchModal
        open={showCarrierSearch}
        onClose={() => setShowCarrierSearch(false)}
        onSelect={handleCarrierSelect}
      />
      
      <div className="flex items-start gap-6">
        {/* Main Form Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Merchant Payment
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={fillDemo} variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Fill Demo
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline" className="gap-2 border-foreground/20 hover:bg-foreground hover:text-background">
                <Download className="w-4 h-4" />
                Download PDF
          </Button>
        </div>
      </div>

      {/* BOL Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>BOL Number</Label>
            <Input
              value={formData.bolNumber}
              onChange={(e) => setFormData({ ...formData, bolNumber: e.target.value })}
              placeholder="BOL-YYYY-XXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Booking Reference</Label>
            <Input
              value={formData.bookingRef}
              onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
              placeholder="TM-XXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Move Date
            </Label>
            <Input
              type="date"
              value={formData.moveDate}
              onChange={(e) => setFormData({ ...formData, moveDate: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Origin */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Origin (Shipper)
              </span>
              <Button
                onClick={() => openClientSearch("origin")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Import Client
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.originName}
                onChange={(e) => setFormData({ ...formData, originName: e.target.value })}
                placeholder="Shipper name"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.originAddress}
                onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                placeholder="Full pickup address"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.originPhone}
                onChange={(e) => setFormData({ ...formData, originPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Destination (Consignee)
              </span>
              <Button
                onClick={() => openClientSearch("dest")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Import Client
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.destName}
                onChange={(e) => setFormData({ ...formData, destName: e.target.value })}
                placeholder="Consignee name"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.destAddress}
                onChange={(e) => setFormData({ ...formData, destAddress: e.target.value })}
                placeholder="Full delivery address"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.destPhone}
                onChange={(e) => setFormData({ ...formData, destPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Carrier Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Carrier Information
              </span>
              <Button
                onClick={() => setShowCarrierSearch(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <History className="w-3.5 h-3.5" />
                Import from Past Move
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Carrier Name</Label>
              <Input
                value={formData.carrierName}
                onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
                placeholder="Carrier company"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MC Number</Label>
                <Input
                  value={formData.carrierMC}
                  onChange={(e) => setFormData({ ...formData, carrierMC: e.target.value })}
                  placeholder="MC-XXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>DOT Number</Label>
                <Input
                  value={formData.carrierDOT}
                  onChange={(e) => setFormData({ ...formData, carrierDOT: e.target.value })}
                  placeholder="XXXXXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Driver full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Truck Number</Label>
                <Input
                  value={formData.truckNumber}
                  onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                  placeholder="TRK-XXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Weight (lbs)</Label>
                <Input
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Pieces</Label>
                <Input
                  value={formData.pieces}
                  onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                placeholder="Any special handling instructions..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button variant="outline" className="gap-2 border-foreground/20 hover:bg-foreground hover:text-background">
            <Receipt className="w-4 h-4" />
            Generate BOL
          </Button>
        </div>
        </div>
        
        {/* Right Sidebar - Document Status */}
        <div className="w-64 flex-shrink-0">
          <ESignStatusCard
            documentTitle="Bill of Lading"
            recipientEmail={formData.originPhone ? undefined : undefined}
            recipientName={formData.originName}
            isSigned={!!formData.bolNumber && !!formData.originName && !!formData.destName}
            refNumber={formData.bolNumber || "BOL-PENDING"}
          />
        </div>
      </div>
    </div>
  );
}
