-- Allow anonymous (unauthenticated) visitors to submit leads from the website
CREATE POLICY "Anon can insert unassigned leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (assigned_agent_id IS NULL);