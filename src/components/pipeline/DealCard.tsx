import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, MapPin } from "lucide-react";
import { Deal } from "./types";
import { differenceInDays, parseISO, format } from "date-fns";

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

function getUrgencyColor(daysInStage: number) {
  if (daysInStage >= 5) return "border-l-red-500";
  if (daysInStage >= 2) return "border-l-yellow-500";
  return "border-l-emerald-500";
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysInStage = differenceInDays(new Date(), parseISO(deal.updated_at));
  const lead = deal.leads;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 cursor-grab active:cursor-grabbing border-l-[3px] ${getUrgencyColor(daysInStage)} hover:bg-accent/50 transition-colors`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(deal);
      }}
    >
      <h4 className="font-medium text-xs text-foreground truncate leading-tight">
        {lead ? `${lead.first_name} ${lead.last_name}` : "No lead"}
      </h4>
      <div className="flex items-center justify-between mt-0.5">
        {deal.deal_value ? (
          <span className="text-[10px] font-semibold text-primary">${deal.deal_value.toLocaleString()}</span>
        ) : (
          <span className="text-[10px] text-muted-foreground">No value</span>
        )}
        {lead?.move_date && (
          <span className="text-[10px] text-muted-foreground">{format(parseISO(lead.move_date), "MMM d")}</span>
        )}
      </div>
    </Card>
  );
}
