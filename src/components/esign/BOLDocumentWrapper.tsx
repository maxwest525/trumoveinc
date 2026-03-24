import { useState, useEffect } from "react";
import { BillOfLadingForm } from "@/components/agent/BillOfLadingForm";
import { Button } from "@/components/ui/button";
import { Check, Paperclip, X, Package, Scale } from "lucide-react";
import { toast } from "sonner";
import { type InventoryItem, calculateTotalWeight, calculateTotalCubicFeet } from "@/lib/priceCalculator";

interface BOLDocumentWrapperProps {
  typedName: string;
  onTypedNameChange: (name: string) => void;
  isSubmitted?: boolean;
  onSubmit?: () => void;
}

export function BOLDocumentWrapper({ 
  typedName, 
  onTypedNameChange,
  isSubmitted = false,
  onSubmit,
}: BOLDocumentWrapperProps) {
  const [attachedInventory, setAttachedInventory] = useState<InventoryItem[] | null>(null);

  const handleAttachInventory = () => {
    // Try multiple localStorage keys where inventory might be stored
    const scannedInventory = localStorage.getItem('tm_scanned_inventory');
    const estimateInventory = localStorage.getItem('trumove_inventory');
    
    let inventoryData: InventoryItem[] | null = null;
    
    if (scannedInventory) {
      try {
        inventoryData = JSON.parse(scannedInventory);
      } catch (e) {
        console.error("Failed to parse scanned inventory:", e);
      }
    } else if (estimateInventory) {
      try {
        inventoryData = JSON.parse(estimateInventory);
      } catch (e) {
        console.error("Failed to parse estimate inventory:", e);
      }
    }
    
    if (inventoryData && inventoryData.length > 0) {
      setAttachedInventory(inventoryData);
      toast.success(`Attached ${inventoryData.length} inventory items`);
    } else {
      toast.error("No inventory found. Complete an estimate first to generate inventory.");
    }
  };

  const handleRemoveInventory = () => {
    setAttachedInventory(null);
    toast.success("Inventory removed from document");
  };

  const totalItems = attachedInventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalWeight = attachedInventory ? calculateTotalWeight(attachedInventory) : 0;
  const totalCubicFeet = attachedInventory ? calculateTotalCubicFeet(attachedInventory) : 0;

  return (
    <div className="bg-white rounded-lg border border-border shadow-xl">
      <div className="p-6">
        <BillOfLadingForm />
      </div>
      
      {/* Attached Inventory Preview */}
      {attachedInventory && attachedInventory.length > 0 && (
        <div className="mx-6 mb-4 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Attached Inventory</span>
            </div>
            <button 
              onClick={handleRemoveInventory}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove inventory"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{totalItems}</span>
              <span className="text-muted-foreground">items</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{totalWeight.toLocaleString()}</span>
              <span className="text-muted-foreground">lbs</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{totalCubicFeet}</span>
              <span className="text-muted-foreground">cu ft</span>
            </div>
          </div>
          
          {/* Compact Item List */}
          <div className="mt-3 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {attachedInventory.slice(0, 12).map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 text-xs py-1 px-2 bg-background rounded border border-border/50">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span className="truncate flex-1">{item.name}</span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </div>
              ))}
              {attachedInventory.length > 12 && (
                <div className="flex items-center justify-center text-xs text-muted-foreground py-1 px-2">
                  +{attachedInventory.length - 12} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer with Attach Inventory and Submit button */}
      <div className="px-10 pb-6 flex items-center justify-end gap-3 border-t border-muted pt-4 mx-6">
        {!attachedInventory ? (
          <Button onClick={handleAttachInventory} variant="outline" className="gap-2">
            <Paperclip className="h-4 w-4" />
            Attach Inventory
          </Button>
        ) : (
          <Button onClick={handleRemoveInventory} variant="outline" className="gap-2 text-muted-foreground">
            <X className="h-4 w-4" />
            Remove Inventory
          </Button>
        )}
        {!isSubmitted ? (
          <Button onClick={onSubmit} className="gap-2">
            <Check className="h-4 w-4" />
            Submit Merchant Payment
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Check className="h-4 w-4" />
            All Documents Submitted
          </div>
        )}
      </div>
    </div>
  );
}
