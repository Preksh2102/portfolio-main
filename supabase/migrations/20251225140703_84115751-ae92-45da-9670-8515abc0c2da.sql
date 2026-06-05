-- Drop existing SELECT policies on contact_messages
DROP POLICY IF EXISTS "Admins can view submissions" ON public.contact_messages;

-- Recreate the admin SELECT policy as a PERMISSIVE policy (default)
CREATE POLICY "Admins can view submissions"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));