-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create research_papers table
CREATE TABLE public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract TEXT,
  field TEXT,
  published_date DATE,
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;

-- Create site_settings table for homepage text, resume URL, etc.
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: users can view their own roles, admins can manage all
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users can manage their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- projects: public read, admin write
CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- research_papers: public read published, admin write
CREATE POLICY "Anyone can view published papers"
  ON public.research_papers FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all papers"
  ON public.research_papers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage papers"
  ON public.research_papers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- site_settings: public read, admin write
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- contact_submissions: anyone can insert, admin can read
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage submissions"
  ON public.contact_submissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for PDFs and images
INSERT INTO storage.buckets (id, name, public) VALUES ('papers', 'papers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resume', 'resume', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

-- Storage policies
CREATE POLICY "Public can view papers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'papers');

CREATE POLICY "Admins can upload papers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'papers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update papers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'papers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete papers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'papers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view resume"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resume');

CREATE POLICY "Admins can upload resume"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resume' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resume"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resume' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resume"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resume' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', "Preksh's Portfolio"),
  ('tagline', 'AI Developer | Machine Learning Researcher'),
  ('bio', 'Machine Learning Researcher passionate about advancing AI capabilities through innovative projects and cutting-edge research.'),
  ('github_url', 'https://github.com'),
  ('linkedin_url', 'https://linkedin.com'),
  ('scholar_url', 'https://scholar.google.com'),
  ('email', 'contact@example.com'),
  ('location', 'San Francisco, CA'),
  ('resume_url', '');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at
  BEFORE UPDATE ON public.research_papers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();