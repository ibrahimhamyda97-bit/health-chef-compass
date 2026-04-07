
-- Add media fields to pastry_courses
ALTER TABLE public.pastry_courses
  ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]'::jsonb;

-- Create event_cakes table for cake sales
CREATE TABLE public.event_cakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  event_type text NOT NULL DEFAULT 'anniversaire',
  servings_min int DEFAULT 6,
  servings_max int DEFAULT 50,
  available boolean NOT NULL DEFAULT true,
  options jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_cakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available cakes" ON public.event_cakes
  FOR SELECT TO public USING (available = true);

CREATE POLICY "Authenticated users can manage cakes" ON public.event_cakes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add programmable monetization: which features are gated
ALTER TABLE public.monetization_settings
  ADD COLUMN IF NOT EXISTS feature_key text;
