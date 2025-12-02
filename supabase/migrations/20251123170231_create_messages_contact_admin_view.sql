-- Create messages_contact_admin view with security_invoker
drop view if exists public.messages_contact_admin cascade;
create view public.messages_contact_admin
with (security_invoker = true)
as
select
  mc.id,
  mc.created_at,
  now() - mc.created_at as age,
  mc.firstname,
  mc.lastname,
  trim(coalesce(mc.firstname,'') || ' ' || coalesce(mc.lastname,'')) as full_name,
  mc.email,
  mc.phone,
  mc.reason,
  mc.message,
  mc.status,
  mc.processed,
  mc.processed_at,
  case when mc.processed_at is not null then mc.processed_at - mc.created_at end as processing_latency,
  mc.consent,
  mc.consent_at,
  mc.spam_score,
  mc.metadata,
  mc.contact_presse_id,
  cp.nom as contact_presse_nom,
  cp.email as contact_presse_email
from public.messages_contact mc
left join public.contacts_presse as cp on cp.id = mc.contact_presse_id
order by
  case
    when mc.status = 'nouveau' then 1
    when mc.status = 'en_cours' then 2
    when mc.status = 'traite' then 3
    else 4
  end,
  mc.created_at desc;

comment on view public.messages_contact_admin is 'Vue pour l administration: suivi des messages, latences, association presse.';

