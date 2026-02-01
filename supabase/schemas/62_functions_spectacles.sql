-- Fonctions RPC pour la gestion des spectacles
-- Ordre: 62 - Après les tables de relations

-- ===== SWAP PHOTO ORDER =====

/*
 * Swap landscape photo order for a spectacle (0 ↔ 1)
 * 
 * Security Model: SECURITY INVOKER
 * 
 * Rationale:
 *   1. Admin-only operation protected by RLS policies on spectacles_medias
 *   2. Atomic swap using CASE statement for consistency
 *   3. Only affects landscape photos (type filter)
 * 
 * Usage:
 *   SELECT swap_spectacle_photo_order(123);
 */
create or replace function public.swap_spectacle_photo_order(p_spectacle_id bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Swap ordre 0 ↔ 1 for landscape photos
  update public.spectacles_medias
  set ordre = case 
    when ordre = 0 then 1
    when ordre = 1 then 0
    else ordre
  end
  where spectacle_id = p_spectacle_id
    and type = 'landscape'
    and ordre in (0, 1);
end;
$$;

comment on function public.swap_spectacle_photo_order(bigint) is 
  'Swaps the display order of landscape photos for a spectacle (0 ↔ 1). Admin-only via RLS.';
