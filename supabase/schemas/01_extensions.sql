-- Extensions requises pour Rouge Cardinal Company
-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires

create extension if not exists "pgcrypto"; -- Génération UUID optionnelle
create extension if not exists pg_trgm;   -- Index trigram pour recherche fuzzy
