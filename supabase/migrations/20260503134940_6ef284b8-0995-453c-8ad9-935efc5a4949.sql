CREATE TABLE public.chef_gallery_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL,
  user_id UUID NOT NULL,
  display_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chef_gallery_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.chef_gallery_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can comment"
ON public.chef_gallery_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.chef_gallery_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.chef_gallery_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_chef_gallery_comments_photo ON public.chef_gallery_comments(photo_id, created_at DESC);

CREATE TRIGGER update_chef_gallery_comments_updated_at
BEFORE UPDATE ON public.chef_gallery_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();