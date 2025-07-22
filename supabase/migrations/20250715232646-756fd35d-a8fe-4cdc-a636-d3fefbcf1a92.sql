-- Criar tabela de propriedades
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area DECIMAL(8,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartamento', 'casa', 'terreno', 'comercial')),
  purpose TEXT NOT NULL CHECK (purpose IN ('venda', 'aluguel')),
  image_url TEXT,
  features TEXT[], -- Array de características (piscina, garagem, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  property_id UUID REFERENCES public.properties(id),
  message TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido', 'perdido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas para propriedades (público pode ver, mas não editar)
CREATE POLICY "Todos podem visualizar propriedades ativas" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

-- Políticas para leads (qualquer um pode inserir)
CREATE POLICY "Qualquer um pode criar leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.properties (title, description, price, location, bedrooms, bathrooms, area, type, purpose, image_url, features) VALUES
('Apartamento Moderno no Centro', 'Lindo apartamento com acabamento de primeira qualidade', 450000.00, 'Centro, São Paulo - SP', 2, 2, 85.00, 'apartamento', 'venda', '/placeholder.svg', ARRAY['Sacada', 'Garagem', 'Portaria 24h']),
('Casa de Luxo com Piscina', 'Casa ampla com piscina e área gourmet completa', 1200000.00, 'Alphaville, Barueri - SP', 4, 3, 280.00, 'casa', 'venda', '/placeholder.svg', ARRAY['Piscina', 'Área Gourmet', 'Jardim', 'Garagem para 3 carros']),
('Apartamento Aconchegante', 'Perfeito para casal ou solteiros, bem localizado', 2800.00, 'Vila Madalena, São Paulo - SP', 1, 1, 45.00, 'apartamento', 'aluguel', '/placeholder.svg', ARRAY['Mobiliado', 'Pet Friendly', 'Academia']),
('Casa Familiar', 'Ideal para famílias, próximo a escolas e parques', 850000.00, 'Jardim Europa, São Paulo - SP', 3, 2, 180.00, 'casa', 'venda', '/placeholder.svg', ARRAY['Quintal', 'Churrasqueira', 'Garagem para 2 carros']);