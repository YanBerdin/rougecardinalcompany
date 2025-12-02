-- Diagnostic: Vérifier si le user admin existe dans profiles
-- User ID from logs: 4ea792b9-4cd9-4363-98aa-641fad96ee16

-- 1. Check if user exists in profiles
SELECT 
  user_id,
  email,
  role,
  created_at
FROM public.profiles 
WHERE user_id = '4ea792b9-4cd9-4363-98aa-641fad96ee16';

-- 2. Check if is_admin() function exists
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- 3. Test is_admin() function directly
-- This will only work if you run this as the authenticated user
-- SELECT public.is_admin();
