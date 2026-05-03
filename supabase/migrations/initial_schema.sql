-- ==========================================
-- ESQUEMA COMPLETO NUTRI-ZENITH (PRODUCCIÓN)
-- ==========================================

-- 1. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre text,
  numero text,
  correo text UNIQUE,
  role text DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

-- 2. TABLA DE DIETAS
CREATE TABLE IF NOT EXISTS public.diets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  plan jsonb NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. CONFIGURACIÓN DE SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO (Profiles)
CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins ven todos los perfiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  OR (auth.jwt() ->> 'email' = 'nutrizenithapp@gmail.com')
);

-- 5. POLÍTICAS DE ACCESO (Diets)
CREATE POLICY "Ver dietas verificadas" ON public.diets FOR SELECT USING (is_verified = true);
CREATE POLICY "Usuarios ven sus propias dietas" ON public.diets FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Usuarios crean sus propias dietas" ON public.diets FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 6. FUNCIONES RPC (Lógica de Servidor)

-- Comprobar si existe email
CREATE OR REPLACE FUNCTION check_email_exists(lookup_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE correo = lookup_email);
END;
$$;

-- Obtener perfiles para el admin
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF public.profiles LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') 
     OR (auth.jwt() ->> 'email' = 'nutrizenithapp@gmail.com') THEN
    RETURN QUERY SELECT * FROM public.profiles;
  ELSE
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
END;
$$;

-- Obtener dietas con nombres de autor para el admin
CREATE OR REPLACE FUNCTION get_all_diets_with_profiles()
RETURNS TABLE (
  id uuid, titulo text, descripcion text, is_verified boolean, 
  created_at timestamptz, plan jsonb, creator_nombre text, creator_role text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR auth.jwt() ->> 'email' = 'nutrizenithapp@gmail.com') THEN
    RETURN QUERY 
    SELECT d.id, d.titulo, d.descripcion, d.is_verified, d.created_at, d.plan, p.nombre, p.role
    FROM public.diets d
    JOIN public.profiles p ON d.creator_id = p.id;
  ELSE
    RAISE EXCEPTION 'Acceso denegado';
  END IF;
END;
$$;
