drop extension if exists "pg_net";


  create table "public"."daily_records" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "date" date default CURRENT_DATE,
    "kcal_consumed" integer default 0,
    "kcal_burned" integer default 0,
    "water_ml" integer default 0,
    "steps" integer default 0,
    "weight" numeric(5,2),
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."daily_records" enable row level security;


  create table "public"."diets" (
    "id" uuid not null default gen_random_uuid(),
    "creator_id" uuid,
    "titulo" text not null,
    "descripcion" text,
    "plan" jsonb not null,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."diets" enable row level security;


  create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "creator_id" uuid,
    "nombre" text not null,
    "kcal" integer not null,
    "barcode" text,
    "calidad" integer,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default now(),
    "image_url" text
      );


alter table "public"."products" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "nombre" text not null,
    "numero" text,
    "correo" text not null,
    "created_at" timestamp with time zone default now(),
    "role" text default 'client'::text
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX daily_records_pkey ON public.daily_records USING btree (id);

CREATE UNIQUE INDEX daily_records_user_id_date_key ON public.daily_records USING btree (user_id, date);

CREATE UNIQUE INDEX diets_pkey ON public.diets USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."daily_records" add constraint "daily_records_pkey" PRIMARY KEY using index "daily_records_pkey";

alter table "public"."diets" add constraint "diets_pkey" PRIMARY KEY using index "diets_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."daily_records" add constraint "daily_records_user_id_date_key" UNIQUE using index "daily_records_user_id_date_key";

alter table "public"."daily_records" add constraint "daily_records_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."daily_records" validate constraint "daily_records_user_id_fkey";

alter table "public"."diets" add constraint "diets_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."diets" validate constraint "diets_creator_id_fkey";

alter table "public"."products" add constraint "products_calidad_check" CHECK (((calidad >= 1) AND (calidad <= 5))) not valid;

alter table "public"."products" validate constraint "products_calidad_check";

alter table "public"."products" add constraint "products_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public.profiles(id) not valid;

alter table "public"."products" validate constraint "products_creator_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.auto_verify_admin_diet()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
BEGIN
  -- Buscamos el rol del creador en la tabla profiles
  SELECT role INTO v_role FROM public.profiles WHERE id = NEW.creator_id;
  
  -- Si el rol es 'admin', verificamos la dieta automáticamente
  IF v_role = 'admin' THEN
    NEW.is_verified := true;
  ELSE
    NEW.is_verified := false;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists(lookup_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE correo = lookup_email);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_if_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_diets_with_profiles()
 RETURNS TABLE(id uuid, titulo text, descripcion text, is_verified boolean, created_at timestamp with time zone, plan jsonb, creator_id uuid, creator_nombre text, creator_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR auth.jwt() ->> 'email' = 'nutrizenithapp@gmail.com') THEN
    RETURN QUERY 
    SELECT d.id, d.titulo, d.descripcion, d.is_verified, d.created_at, d.plan, d.creator_id, p.nombre, p.role
    FROM public.diets d
    JOIN public.profiles p ON d.creator_id = p.id;
  ELSE
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_profiles()
 RETURNS SETOF public.profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
     OR (auth.jwt() ->> 'email' = 'nutrizenithapp@gmail.com') THEN
    RETURN QUERY SELECT * FROM public.profiles WHERE role = 'client';
  ELSE
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role_by_email(lookup_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE correo = lookup_email LIMIT 1);
END;
$function$
;

grant delete on table "public"."daily_records" to "anon";

grant insert on table "public"."daily_records" to "anon";

grant references on table "public"."daily_records" to "anon";

grant select on table "public"."daily_records" to "anon";

grant trigger on table "public"."daily_records" to "anon";

grant truncate on table "public"."daily_records" to "anon";

grant update on table "public"."daily_records" to "anon";

grant delete on table "public"."daily_records" to "authenticated";

grant insert on table "public"."daily_records" to "authenticated";

grant references on table "public"."daily_records" to "authenticated";

grant select on table "public"."daily_records" to "authenticated";

grant trigger on table "public"."daily_records" to "authenticated";

grant truncate on table "public"."daily_records" to "authenticated";

grant update on table "public"."daily_records" to "authenticated";

grant delete on table "public"."daily_records" to "service_role";

grant insert on table "public"."daily_records" to "service_role";

grant references on table "public"."daily_records" to "service_role";

grant select on table "public"."daily_records" to "service_role";

grant trigger on table "public"."daily_records" to "service_role";

grant truncate on table "public"."daily_records" to "service_role";

grant update on table "public"."daily_records" to "service_role";

grant delete on table "public"."diets" to "anon";

grant insert on table "public"."diets" to "anon";

grant references on table "public"."diets" to "anon";

grant select on table "public"."diets" to "anon";

grant trigger on table "public"."diets" to "anon";

grant truncate on table "public"."diets" to "anon";

grant update on table "public"."diets" to "anon";

grant delete on table "public"."diets" to "authenticated";

grant insert on table "public"."diets" to "authenticated";

grant references on table "public"."diets" to "authenticated";

grant select on table "public"."diets" to "authenticated";

grant trigger on table "public"."diets" to "authenticated";

grant truncate on table "public"."diets" to "authenticated";

grant update on table "public"."diets" to "authenticated";

grant delete on table "public"."diets" to "service_role";

grant insert on table "public"."diets" to "service_role";

grant references on table "public"."diets" to "service_role";

grant select on table "public"."diets" to "service_role";

grant trigger on table "public"."diets" to "service_role";

grant truncate on table "public"."diets" to "service_role";

grant update on table "public"."diets" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Users can manage their own daily records"
  on "public"."daily_records"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Admin_Gestion_Total"
  on "public"."diets"
  as permissive
  for all
  to public
using (public.check_if_admin())
with check (public.check_if_admin());



  create policy "Clientes solo lectura"
  on "public"."diets"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'client'::text)))));



  create policy "Cualquier autenticado ve todas las dietas"
  on "public"."diets"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Users can delete their own diets"
  on "public"."diets"
  as permissive
  for delete
  to public
using ((auth.uid() = creator_id));



  create policy "Users can update their own diets"
  on "public"."diets"
  as permissive
  for update
  to public
using ((auth.uid() = creator_id))
with check ((auth.uid() = creator_id));



  create policy "Usuarios crean sus propias dietas"
  on "public"."diets"
  as permissive
  for insert
  to public
with check ((auth.uid() = creator_id));



  create policy "Usuarios eliminan sus propias dietas"
  on "public"."diets"
  as permissive
  for delete
  to public
using ((auth.uid() = creator_id));



  create policy "Admins gestionan productos"
  on "public"."products"
  as permissive
  for all
  to public
using (public.check_if_admin())
with check (public.check_if_admin());



  create policy "Cualquier autenticado ve productos"
  on "public"."products"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Users can delete their own products"
  on "public"."products"
  as permissive
  for delete
  to public
using ((auth.uid() = creator_id));



  create policy "Users can insert their own products"
  on "public"."products"
  as permissive
  for insert
  to public
with check ((auth.uid() = creator_id));



  create policy "Users can update their own products"
  on "public"."products"
  as permissive
  for update
  to public
using ((auth.uid() = creator_id))
with check ((auth.uid() = creator_id));



  create policy "Users can view all products"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Perfil_Lectura_Universal"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));


CREATE TRIGGER tr_auto_verify_diet BEFORE INSERT ON public.diets FOR EACH ROW EXECUTE FUNCTION public.auto_verify_admin_diet();

CREATE TRIGGER tr_auto_verify_product BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.auto_verify_admin_diet();


