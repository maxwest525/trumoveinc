
-- Create support_tickets table for customer service form submissions
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form, no auth required)
CREATE POLICY "Anyone can submit a support ticket"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (agents) can view tickets
CREATE POLICY "Authenticated users can view tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update tickets
CREATE POLICY "Authenticated users can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
