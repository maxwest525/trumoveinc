ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;