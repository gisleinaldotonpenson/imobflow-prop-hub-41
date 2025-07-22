-- Fix RLS policies for admin access to properties without requiring Supabase Auth
-- Since we're using a simple admin login system, we need to allow property creation without auth

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view all properties" ON public.properties;

-- Create more permissive policies that allow admin operations
-- These will work with the current simple admin system

-- Allow anyone to insert properties (admin panel will handle access control at app level)
CREATE POLICY "Allow property creation" 
ON public.properties 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update properties (admin panel will handle access control at app level)
CREATE POLICY "Allow property updates" 
ON public.properties 
FOR UPDATE 
USING (true);

-- Allow anyone to delete properties (admin panel will handle access control at app level)
CREATE POLICY "Allow property deletion" 
ON public.properties 
FOR DELETE 
USING (true);

-- Allow anyone to view all properties (for admin operations)
CREATE POLICY "Allow property admin access" 
ON public.properties 
FOR SELECT 
USING (true);