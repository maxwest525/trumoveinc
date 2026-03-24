-- Allow anonymous users to look up esign_documents by ref_number (for public signing page)
CREATE POLICY "Public can read esign docs by ref"
  ON public.esign_documents
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read lead name/email for the signing page
CREATE POLICY "Public can read lead basics for esign"
  ON public.leads
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.esign_documents ed
      WHERE ed.lead_id = leads.id
    )
  );