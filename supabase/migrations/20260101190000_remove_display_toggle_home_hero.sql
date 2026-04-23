-- migration: remove_display_toggle_home_hero
-- purpose: ce toggle a été créé par erreur. le hero banner est désormais
--          toujours visible, conditionné uniquement par la présence de slides actifs.
-- affected: public.configurations_site (delete 1 row)
-- rls: n/a (delete row, no rls change)
-- special: aucun — idempotent (0 rows affected si déjà absent)

-- destructive: supprime la ligne 'display_toggle_home_hero' de configurations_site.
-- le hero banner ne sera plus contrôlé par un toggle — visibilité dépend des slides actifs.
delete from public.configurations_site
where key = 'display_toggle_home_hero';
