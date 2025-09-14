-- Table evenements - Événements programmés
-- Ordre: 07 - Dépend de spectacles et lieux

drop table if exists public.evenements cascade;
create table public.evenements (
  id bigint generated always as identity primary key,
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  lieu_id bigint null references public.lieux(id) on delete set null,
  date_debut timestamptz not null,
  date_fin timestamptz null,
  capacity integer,
  price_cents integer null,
  status text default 'scheduled',
  metadata jsonb default '{}'::jsonb,
  recurrence_rule text,
  recurrence_end_date timestamptz,
  parent_event_id bigint references public.evenements(id) on delete cascade,
  ticket_url text, -- URL vers la billetterie externe
  image_url text, -- URL d'image pour l'événement spécifique
  start_time time, -- Heure de début (complément à date_debut)
  end_time time, -- Heure de fin (complément à date_fin ou durée)
  type_array text[] default '{}', -- Tableau des types d'événements (spectacle, atelier, rencontre, etc.)
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.evenements is 'Séances programmées de spectacles, avec date et lieu';
comment on column public.evenements.recurrence_rule is 'Règle de récurrence au format RRULE (RFC 5545)';
comment on column public.evenements.recurrence_end_date is 'Date de fin de la récurrence';
comment on column public.evenements.parent_event_id is 'Référence vers l''événement parent pour les occurrences générées';
comment on column public.evenements.ticket_url is 'URL vers la billetterie externe ou système de réservation';
comment on column public.evenements.image_url is 'URL d''image spécifique à cet événement (complément aux médias du spectacle)';
comment on column public.evenements.start_time is 'Heure de début précise (complément à date_debut pour horaires)';
comment on column public.evenements.end_time is 'Heure de fin précise (complément à date_fin ou calcul de durée)';
comment on column public.evenements.type_array is 'Tableau des types d''événements : spectacle, première, atelier, rencontre, etc.';
