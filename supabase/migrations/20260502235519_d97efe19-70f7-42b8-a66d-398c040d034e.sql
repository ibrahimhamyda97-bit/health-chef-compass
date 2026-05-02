
-- Gallery photos
CREATE TABLE public.chef_gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT,
  title TEXT,
  photo_url TEXT NOT NULL,
  before_photo_url TEXT,
  is_challenge BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chef_gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery photos"
ON public.chef_gallery_photos FOR SELECT USING (true);

CREATE POLICY "Users can upload their own photos"
ON public.chef_gallery_photos FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
ON public.chef_gallery_photos FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.chef_gallery_photos FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_chef_gallery_photos_updated_at
BEFORE UPDATE ON public.chef_gallery_photos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes
CREATE TABLE public.chef_gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.chef_gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

ALTER TABLE public.chef_gallery_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
ON public.chef_gallery_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
ON public.chef_gallery_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their like"
ON public.chef_gallery_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chef-gallery', 'chef-gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view chef gallery"
ON storage.objects FOR SELECT USING (bucket_id = 'chef-gallery');

CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chef-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chef-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
