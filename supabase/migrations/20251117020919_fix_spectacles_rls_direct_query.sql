-- Migration: Fix spectacles RLS INSERT policy with direct profiles query
-- Purpose: Replace is_admin() function call with direct query to avoid context issues
-- Issue: RLS policy evaluation context differs from RPC call context

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create spectacles" ON public.spectacles;

-- Recreate with direct query to profiles table
-- This avoids any function execution context issues
CREATE POLICY "Authenticated users can create spectacles"
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

-- Add comment explaining the policy
COMMENT ON POLICY "Authenticated users can create spectacles" ON public.spectacles IS
'Allows authenticated users with admin role to create spectacles. Uses direct query to profiles table to avoid function context issues.';
