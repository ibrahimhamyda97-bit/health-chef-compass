
-- Pastry courses table for admin to publish courses
CREATE TABLE public.pastry_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'débutant',
  duration TEXT,
  content TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Monetization settings table
CREATE TABLE public.monetization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pastry_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetization_settings ENABLE ROW LEVEL SECURITY;

-- Courses: everyone can read published courses
CREATE POLICY "Anyone can view published courses" ON public.pastry_courses FOR SELECT USING (published = true);

-- Courses: authenticated users can manage (admin check in app)
CREATE POLICY "Authenticated users can manage courses" ON public.pastry_courses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Monetization: authenticated users can manage
CREATE POLICY "Authenticated users can manage monetization" ON public.monetization_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Monetization: public read
CREATE POLICY "Anyone can read monetization settings" ON public.monetization_settings FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_pastry_courses_updated_at BEFORE UPDATE ON public.pastry_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monetization_updated_at BEFORE UPDATE ON public.monetization_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
