import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Truck, CheckCircle, AlertTriangle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarrierMoveData {
  carrierName: string;
  carrierMC: string;
  driverName: string;
  truckNumber: string;
  dotNumber?: string;
  moveDate?: string;
  route?: string;
}

// TODO: Fetch from DB
const PAST_MOVES: CarrierMoveData[] = [];

interface CarrierSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (carrier: CarrierMoveData) => void;
}

export function CarrierSearchModal({ open, onClose, onSelect }: CarrierSearchModalProps) {
  const [search, setSearch] = useState("");

  const filteredMoves = PAST_MOVES.filter(
    (move) =>
      move.carrierName.toLowerCase().includes(search.toLowerCase()) ||
      move.carrierMC.toLowerCase().includes(search.toLowerCase()) ||
      move.driverName.toLowerCase().includes(search.toLowerCase()) ||
      move.route?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (move: CarrierMoveData) => {
    onSelect(move);
    onClose();
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Import Carrier from Past Move
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by carrier, MC#, driver, or route..."
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
          {filteredMoves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No matching carriers found</p>
            </div>
          ) : (
            filteredMoves.map((move, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(move)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border border-border",
                  "hover:bg-accent hover:border-primary/30 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium truncate">{move.carrierName}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{move.carrierMC}</span>
                      {move.dotNumber && (
                        <>
                          <span>•</span>
                          <span>DOT #{move.dotNumber}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Driver: <span className="text-foreground">{move.driverName}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Truck: <span className="text-foreground font-mono">{move.truckNumber}</span>
                      </span>
                    </div>
                    {move.route && (
                      <div className="mt-1.5 text-xs text-muted-foreground">
                        {move.moveDate && (
                          <span className="mr-2">{new Date(move.moveDate).toLocaleDateString()}</span>
                        )}
                        <span className="text-foreground/70">{move.route}</span>
                      </div>
                    )}
                  </div>
                  <CheckCircle className="w-4 h-4 text-primary/50 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
