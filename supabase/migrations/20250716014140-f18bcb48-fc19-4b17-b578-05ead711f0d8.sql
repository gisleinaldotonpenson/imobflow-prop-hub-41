-- Inserir imóveis de exemplo
INSERT INTO public.properties (title, description, price, location, bedrooms, bathrooms, area, type, purpose, image_url, features) VALUES 
('Casa Moderna em Setor Bueno', 'Linda casa com 3 quartos, sendo 1 suíte, em localização privilegiada. Área de lazer completa com piscina e churrasqueira.', 650000.00, 'Setor Bueno, Goiânia - GO', 3, 2, 180.50, 'Casa', 'venda', '/assets/property-1.jpg', ARRAY['Piscina', 'Churrasqueira', 'Garagem para 2 carros', 'Jardim']),

('Apartamento Luxo Setor Oeste', 'Apartamento de alto padrão com vista panorâmica da cidade. Acabamentos de primeira qualidade e área de lazer completa.', 480000.00, 'Setor Oeste, Goiânia - GO', 2, 2, 95.00, 'Apartamento', 'venda', '/assets/property-2.jpg', ARRAY['Vista panorâmica', 'Sacada gourmet', 'Academia', 'Piscina', 'Salão de festas']),

('Casa para Aluguel no Jardim Goiás', 'Casa ampla e confortável para aluguel, ideal para famílias. Localização estratégica próxima a escolas e comércios.', 2800.00, 'Jardim Goiás, Goiânia - GO', 4, 3, 220.00, 'Casa', 'aluguel', '/assets/property-3.jpg', ARRAY['Quintal amplo', 'Garagem para 3 carros', 'Escritório', 'Área de serviço']),

('Sobrado em Condomínio Fechado', 'Sobrado novo em condomínio fechado com segurança 24h. Área de lazer completa e localização privilegiada.', 850000.00, 'Alphaville Flamboyant, Goiânia - GO', 4, 4, 280.00, 'Sobrado', 'venda', '/assets/property-4.jpg', ARRAY['Condomínio fechado', 'Segurança 24h', 'Piscina', 'Quadra de tênis', 'Playground']),

('Apartamento Studio Downtown', 'Studio moderno e funcional no centro da cidade. Ideal para investimento ou moradia de solteiros/casais.', 1200.00, 'Centro, Goiânia - GO', 1, 1, 45.00, 'Apartamento', 'aluguel', '/assets/property-1.jpg', ARRAY['Mobiliado', 'Ar condicionado', 'Internet fibra', 'Academia']),

('Casa de Campo em Hidrolândia', 'Casa de campo com amplo terreno, ideal para quem busca tranquilidade e contato com a natureza.', 420000.00, 'Hidrolândia - GO', 3, 2, 150.00, 'Casa', 'venda', '/assets/property-2.jpg', ARRAY['Terreno 2000m²', 'Pomar', 'Poço artesiano', 'Área para animais']);