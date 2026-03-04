
CREATE TABLE public.lead_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  room text NOT NULL DEFAULT 'Living Room',
  quantity integer NOT NULL DEFAULT 1,
  cubic_feet numeric NOT NULL DEFAULT 0,
  weight numeric NOT NULL DEFAULT 0,
  image_url text,
  special_handling boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view lead inventory" ON public.lead_inventory
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_inventory.lead_id
      AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL
        OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

CREATE POLICY "Agents can insert lead inventory" ON public.lead_inventory
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_inventory.lead_id
      AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL
        OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

CREATE POLICY "Agents can update lead inventory" ON public.lead_inventory
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_inventory.lead_id
      AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL
        OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

CREATE POLICY "Agents can delete lead inventory" ON public.lead_inventory
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_inventory.lead_id
      AND (l.assigned_agent_id = auth.uid() OR l.assigned_agent_id IS NULL
        OR has_any_role(auth.uid(), ARRAY['owner'::app_role, 'manager'::app_role]))
    )
  );

-- Also add price_per_cuft to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS price_per_cuft numeric DEFAULT NULL;
