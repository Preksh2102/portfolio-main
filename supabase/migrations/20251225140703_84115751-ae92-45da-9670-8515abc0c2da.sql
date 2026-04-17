-- Drop existing SELECT policies on contact_submissions
DROP POLICY IF EXISTS "Admins can view submissions" ON public.contact_submissions;

-- Recreate the admin SELECT policy as a PERMISSIVE policy (default)
CREATE POLICY "Admins can view submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));