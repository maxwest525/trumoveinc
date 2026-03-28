-- Remove overly permissive anon policies on esign_documents
DROP POLICY IF EXISTS "Public can read esign docs by ref" ON public.esign_documents;
DROP POLICY IF EXISTS "Public can update esign doc status" ON public.esign_documents;

-- Remove anon policy on leads that exposes PII
DROP POLICY IF EXISTS "Public can read lead basics for esign" ON public.leads;