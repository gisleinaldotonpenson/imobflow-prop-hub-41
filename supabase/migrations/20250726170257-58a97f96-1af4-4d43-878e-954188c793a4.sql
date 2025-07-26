-- Create marketing_settings table for storing pixel configurations
CREATE TABLE public.marketing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  facebook_pixel_id TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_settings
CREATE POLICY "Users can view their own marketing settings" 
ON public.marketing_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing settings" 
ON public.marketing_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing settings" 
ON public.marketing_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing settings" 
ON public.marketing_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_marketing_settings_updated_at
BEFORE UPDATE ON public.marketing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();