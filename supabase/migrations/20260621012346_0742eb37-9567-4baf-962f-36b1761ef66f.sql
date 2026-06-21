
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID NOT NULL,
  host_name TEXT NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER NOT NULL DEFAULT 0
);

GRANT SELECT ON public.live_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_sessions TO authenticated;
GRANT ALL ON public.live_sessions TO service_role;

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live sessions"
  ON public.live_sessions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can start lives"
  ON public.live_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their own lives"
  ON public.live_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their own lives"
  ON public.live_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;

-- Storage policies for pastry-media bucket (public read, authenticated write)
CREATE POLICY "Anyone can read pastry media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pastry-media');

CREATE POLICY "Authenticated can upload pastry media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pastry-media');

CREATE POLICY "Authenticated can update own pastry media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pastry-media' AND owner = auth.uid());

CREATE POLICY "Authenticated can delete own pastry media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pastry-media' AND owner = auth.uid());
