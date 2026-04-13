CREATE POLICY "Owners and admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner'::app_role, 'admin'::app_role]));