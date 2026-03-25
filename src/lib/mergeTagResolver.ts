import { supabase } from "@/integrations/supabase/client";

interface InventoryItem {
  item_name: string;
  room: string;
  quantity: number;
  cubic_feet: number;
  weight: number;
}

interface LeadData {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  move_date: string | null;
  estimated_value: number | null;
  price_per_cuft: number | null;
  assigned_agent_id: string | null;
}

/**
 * Builds a styled HTML inventory table grouped by room from lead_inventory rows.
 */
export function buildInventoryTableHtml(items: InventoryItem[]): string {
  if (!items.length) return '<p style="color:#9ca3af;font-size:13px;">No inventory items recorded.</p>';

  const byRoom: Record<string, InventoryItem[]> = {};
  for (const item of items) {
    const room = item.room || "Other";
    if (!byRoom[room]) byRoom[room] = [];
    byRoom[room].push(item);
  }

  const thStyle = 'font-size:10px;font-weight:600;color:#9ca3af;padding:8px 14px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #f0f0f0';
  const tdStyle = 'font-size:13px;color:#374151;padding:8px 14px;border-bottom:1px solid #fafafa';

  return Object.entries(byRoom)
    .map(([room, roomItems]) => {
      const rows = roomItems
        .map(
          (it) =>
            `<tr>` +
            `<td style="${tdStyle}">${it.item_name}</td>` +
            `<td style="${tdStyle};text-align:center">${it.quantity}</td>` +
            `<td style="${tdStyle};text-align:right">${Math.round(it.cubic_feet * it.quantity)}</td>` +
            `<td style="${tdStyle};text-align:right">${Math.round(it.weight * it.quantity)}</td>` +
            `</tr>`
        )
        .join("");

      return (
        `<div style="margin:0 0 12px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden">` +
        `<div style="font-size:12px;font-weight:600;color:#374151;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #f0f0f0">${room}</div>` +
        `<table style="width:100%;border-collapse:collapse">` +
        `<tr><td style="${thStyle}">Item</td><td style="${thStyle};text-align:center;width:50px">Qty</td><td style="${thStyle};text-align:right;width:60px">Cu Ft</td><td style="${thStyle};text-align:right;width:60px">Lbs</td></tr>` +
        rows +
        `</table></div>`
      );
    })
    .join("");
}

/**
 * Fetches lead + inventory data and resolves all merge tags in a template string.
 */
export async function resolveMergeTags(
  template: string,
  leadId: string,
  overrides?: Record<string, string>
): Promise<string> {
  // Fetch lead and inventory in parallel
  const [leadRes, inventoryRes, agentRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", leadId).single(),
    supabase.from("lead_inventory").select("*").eq("lead_id", leadId),
    // We'll resolve agent name after we get the lead
    Promise.resolve(null),
  ]);

  const lead: LeadData | null = leadRes.data;
  const inventory: InventoryItem[] = (inventoryRes.data as InventoryItem[]) || [];

  // Fetch agent name if assigned
  let agentName = "Your TruMove Agent";
  if (lead?.assigned_agent_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", lead.assigned_agent_id)
      .single();
    if (profile) {
      agentName = profile.display_name || profile.email || agentName;
    }
  }

  // Compute inventory totals
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalCuFt = inventory.reduce((sum, i) => sum + i.cubic_feet * i.quantity, 0);
  const totalWeight = inventory.reduce((sum, i) => sum + i.weight * i.quantity, 0);

  const inventoryTableHtml = buildInventoryTableHtml(inventory);

  const moveDate = lead?.move_date
    ? new Date(lead.move_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const estimatedValue = lead?.estimated_value
    ? `$${Number(lead.estimated_value).toLocaleString()}`
    : "";

  const pricePerCuFt = lead?.price_per_cuft
    ? `$${Number(lead.price_per_cuft).toFixed(2)}`
    : "";

  const replacements: Record<string, string> = {
    "{customer_name}": lead ? `${lead.first_name} ${lead.last_name}`.trim() : "",
    "{first_name}": lead?.first_name || "",
    "{last_name}": lead?.last_name || "",
    "{email}": lead?.email || "",
    "{phone}": lead?.phone || "",
    "{origin_address}": lead?.origin_address || "",
    "{dest_address}": lead?.destination_address || "",
    "{move_date}": moveDate,
    "{booking_id}": `TM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
    "{estimated_value}": estimatedValue,
    "{tracking_link}": "",
    "{eta}": "",
    "{agent_name}": agentName,
    "{company_name}": "TruMove Inc",
    "{inventory_table}": inventoryTableHtml,
    "{total_cuft}": String(Math.round(totalCuFt)),
    "{total_weight}": totalWeight.toLocaleString(),
    "{total_items}": String(totalItems),
    "{price_per_cuft}": pricePerCuFt,
    // Apply any caller overrides last
    ...overrides,
  };

  let result = template;
  for (const [tag, value] of Object.entries(replacements)) {
    result = result.split(tag).join(value);
  }

  return result;
}
