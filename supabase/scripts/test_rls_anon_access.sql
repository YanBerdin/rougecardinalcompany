-- Test RLS policies for anon role
-- This should succeed if policies are correctly applied

SET ROLE anon;

-- Test 1: home_hero_slides (should return active slides)
SELECT COUNT(*) as home_hero_slides_count FROM public.home_hero_slides;

-- Test 2: communiques_presse (should return public press releases)
SELECT COUNT(*) as communiques_presse_count FROM public.communiques_presse WHERE public = true;

-- Test 3: compagnie_stats (should return all stats)
SELECT COUNT(*) as compagnie_stats_count FROM public.compagnie_stats;

-- Test 4: spectacles (should return public spectacles)
SELECT COUNT(*) as spectacles_count FROM public.spectacles WHERE public = true;

-- Test 5: partners (should return active partners)
SELECT COUNT(*) as partners_count FROM public.partners WHERE is_active = true;

-- Test 6: configurations_site (should return public configs)
SELECT COUNT(*) as configurations_site_count FROM public.configurations_site WHERE key LIKE 'public:%';

-- Test 7: home_about_content (should return all content)
SELECT COUNT(*) as home_about_content_count FROM public.home_about_content;

RESET ROLE;
