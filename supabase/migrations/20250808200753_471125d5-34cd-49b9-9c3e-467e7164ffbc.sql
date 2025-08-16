-- Create a storage bucket for price reports
INSERT INTO storage.buckets (id, name, public) VALUES ('price-reports', 'price-reports', false);

-- Create policies for price report uploads
CREATE POLICY "Users can upload their own price reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own price reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own price reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own price reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a table for price reports
CREATE TABLE public.price_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  store_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  location TEXT,
  image_url TEXT,
  report_type TEXT DEFAULT 'price_sharing' CHECK (report_type IN ('price_sharing', 'overcharging')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.price_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for price reports
CREATE POLICY "Users can view all price reports" 
ON public.price_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own price reports" 
ON public.price_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price reports" 
ON public.price_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price reports" 
ON public.price_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_price_reports_updated_at
BEFORE UPDATE ON public.price_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();