-- 00_extensions.sql
create extension if not exists "pgcrypto"; -- optional: provides gen_random_uuid() if you still need UUIDs
create extension if not exists pg_trgm;   -- optional: trigram indexes for fuzzy search
