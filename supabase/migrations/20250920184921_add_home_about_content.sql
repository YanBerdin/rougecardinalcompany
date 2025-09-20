create table "public"."home_about_content" (
    "id" bigint generated always as identity not null,
    "slug" text not null,
    "title" text not null,
    "intro1" text not null,
    "intro2" text not null,
    "image_url" text,
    "image_media_id" bigint,
    "mission_title" text not null,
    "mission_text" text not null,
    "position" smallint not null default 0,
    "active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."home_about_content" enable row level security;

CREATE UNIQUE INDEX home_about_content_pkey ON public.home_about_content USING btree (id);

CREATE UNIQUE INDEX home_about_content_slug_key ON public.home_about_content USING btree (slug);

CREATE INDEX idx_home_about_content_active_order ON public.home_about_content USING btree (active, "position") WHERE (active = true);

alter table "public"."home_about_content" add constraint "home_about_content_pkey" PRIMARY KEY using index "home_about_content_pkey";

alter table "public"."home_about_content" add constraint "home_about_content_image_media_id_fkey" FOREIGN KEY (image_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."home_about_content" validate constraint "home_about_content_image_media_id_fkey";

alter table "public"."home_about_content" add constraint "home_about_content_slug_key" UNIQUE using index "home_about_content_slug_key";

grant delete on table "public"."home_about_content" to "anon";

grant insert on table "public"."home_about_content" to "anon";

grant references on table "public"."home_about_content" to "anon";

grant select on table "public"."home_about_content" to "anon";

grant trigger on table "public"."home_about_content" to "anon";

grant truncate on table "public"."home_about_content" to "anon";

grant update on table "public"."home_about_content" to "anon";

grant delete on table "public"."home_about_content" to "authenticated";

grant insert on table "public"."home_about_content" to "authenticated";

grant references on table "public"."home_about_content" to "authenticated";

grant select on table "public"."home_about_content" to "authenticated";

grant trigger on table "public"."home_about_content" to "authenticated";

grant truncate on table "public"."home_about_content" to "authenticated";

grant update on table "public"."home_about_content" to "authenticated";

grant delete on table "public"."home_about_content" to "service_role";

grant insert on table "public"."home_about_content" to "service_role";

grant references on table "public"."home_about_content" to "service_role";

grant select on table "public"."home_about_content" to "service_role";

grant trigger on table "public"."home_about_content" to "service_role";

grant truncate on table "public"."home_about_content" to "service_role";

grant update on table "public"."home_about_content" to "service_role";

create policy "Admins can manage home about content"
on "public"."home_about_content"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Home about content is viewable by everyone"
on "public"."home_about_content"
as permissive
for select
to anon, authenticated
using (true);


CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.home_about_content FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.home_about_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


