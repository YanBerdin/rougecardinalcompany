-- Fix: Clean and recreate all RLS policies for spectacles table
-- Remove all existing policies and recreate them cleanly

-- Drop all existing policies
DROP POLICY IF EXISTS "Public spectacles are viewable by everyone" ON public.spectacles;
DROP POLICY IF EXISTS "Authenticated users can create spectacles" ON public.spectacles;
DROP POLICY IF EXISTS "Owners or admins can update spectacles" ON public.spectacles;
DROP POLICY IF EXISTS "Owners or admins can delete spectacles" ON public.spectacles;

-- Recreate policies cleanly

-- SELECT: Public spectacles viewable by everyone, private only by admins
CREATE POLICY "Public spectacles are viewable by everyone"
ON public.spectacles
FOR SELECT
TO anon, authenticated
USING (public = true);

CREATE POLICY "Admins can view all spectacles"
ON public.spectacles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- INSERT: Only admins can create spectacles (public or private)
CREATE POLICY "Admins can create spectacles"
ON public.spectacles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- UPDATE: Owners or admins can update
CREATE POLICY "Owners or admins can update spectacles"
ON public.spectacles
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- DELETE: Owners or admins can delete
CREATE POLICY "Owners or admins can delete spectacles"
ON public.spectacles
FOR DELETE
TO authenticated
USING (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
