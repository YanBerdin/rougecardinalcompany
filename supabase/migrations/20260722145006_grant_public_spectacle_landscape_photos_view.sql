-- migration: grant select access to the public spectacle landscape photos view
-- purpose: restore the grants required for anonymous and authenticated public pages
-- affected: public.spectacles_landscape_photos_public
-- special considerations: aligns the production ACL with the existing declarative schema;
--                        no table, data, or RLS policy is changed

-- The public spectacle detail page queries this security-invoker view with the
-- anonymous Supabase role. Without this table-level grant, PostgREST returns
-- SQLSTATE 42501 before evaluating the RLS policies on the underlying tables.
grant select on table public.spectacles_landscape_photos_public to anon;
grant select on table public.spectacles_landscape_photos_public to authenticated;