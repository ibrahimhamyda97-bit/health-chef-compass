
-- Create cake_listings table
CREATE TABLE public.cake_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cake_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cake listings" ON public.cake_listings
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can create their own listings" ON public.cake_listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON public.cake_listings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON public.cake_listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_cake_listings_updated_at
  BEFORE UPDATE ON public.cake_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for cake photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cake-photos', 'cake-photos', true);

CREATE POLICY "Anyone can view cake photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'cake-photos');

CREATE POLICY "Authenticated users can upload cake photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cake-photos');

CREATE POLICY "Users can delete their own cake photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'cake-photos');
