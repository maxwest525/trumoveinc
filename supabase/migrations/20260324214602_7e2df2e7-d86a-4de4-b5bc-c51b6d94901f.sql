
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view templates" ON public.message_templates
  FOR SELECT TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

CREATE POLICY "Staff can insert templates" ON public.message_templates
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

CREATE POLICY "Staff can update templates" ON public.message_templates
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));

CREATE POLICY "Staff can delete templates" ON public.message_templates
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role, 'manager'::app_role, 'agent'::app_role]));
