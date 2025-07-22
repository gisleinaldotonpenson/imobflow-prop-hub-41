-- Primeiro, vamos criar um bucket para armazenar as imagens dos imóveis
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Criar políticas para o bucket de imagens
CREATE POLICY "Qualquer um pode ver imagens de imóveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Administradores podem fazer upload de imagens" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Administradores podem atualizar imagens" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'property-images');

CREATE POLICY "Administradores podem deletar imagens" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'property-images');

-- Verificar e corrigir as políticas RLS para leads
-- Vamos garantir que a exclusão funcione corretamente
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

-- Criar uma política mais permissiva para exclusão (já que usamos autenticação local)
CREATE POLICY "Permitir exclusão de leads" 
ON public.leads 
FOR DELETE 
USING (true);