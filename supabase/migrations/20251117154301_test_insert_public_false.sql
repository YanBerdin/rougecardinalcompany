-- Test: Try to insert a spectacle with public = false as postgres user
-- This should work if RLS policies are bypassed for superuser

INSERT INTO public.spectacles (
  title, 
  slug, 
  status, 
  duration_minutes, 
  casting, 
  public, 
  created_by
) VALUES (
  'Test Public False', 
  'test-public-false', 
  'draft', 
  60, 
  5, 
  false, 
  '4ea792b9-4cd9-4363-98aa-641fad96ee16'
) RETURNING id, title, public;

-- Clean up
DELETE FROM public.spectacles WHERE title = 'Test Public False';
