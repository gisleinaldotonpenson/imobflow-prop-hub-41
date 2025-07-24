-- Create lead_statuses table
CREATE TABLE public.lead_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status_id UUID REFERENCES public.lead_statuses(id),
  message TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_statuses (publicly viewable for now)
CREATE POLICY "Lead statuses are viewable by everyone" 
ON public.lead_statuses 
FOR SELECT 
USING (true);

CREATE POLICY "Lead statuses can be managed by authenticated users" 
ON public.lead_statuses 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for leads
CREATE POLICY "Leads are viewable by authenticated users" 
ON public.leads 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leads can be managed by authenticated users" 
ON public.leads 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lead_statuses_updated_at
  BEFORE UPDATE ON public.lead_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default lead statuses using proper UUIDs
INSERT INTO public.lead_statuses (id, name, color, order_num) VALUES
(gen_random_uuid(), 'Novo', '#3b82f6', 1),
(gen_random_uuid(), 'Em Atendimento', '#f97316', 2),
(gen_random_uuid(), 'Proposta Enviada', '#8b5cf6', 3),
(gen_random_uuid(), 'Negociação', '#eab308', 4),
(gen_random_uuid(), 'Vendido', '#22c55e', 5),
(gen_random_uuid(), 'Perdido', '#ef4444', 6);