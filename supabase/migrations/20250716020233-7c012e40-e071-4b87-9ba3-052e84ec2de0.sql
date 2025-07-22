-- Fix RLS policies for leads table
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view all leads" ON public.leads;

-- Create new, clear policies
-- Allow anyone (including anonymous users) to create leads
CREATE POLICY "Public can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view leads (for admin purposes)
CREATE POLICY "Public can view leads" 
ON public.leads 
FOR SELECT 
USING (true);

-- Only authenticated users can update leads
CREATE POLICY "Authenticated users can update leads" 
ON public.leads 
FOR UPDATE 
USING (auth.role() = 'authenticated');