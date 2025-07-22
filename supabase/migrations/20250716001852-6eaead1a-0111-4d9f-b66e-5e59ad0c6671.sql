-- Habilitar realtime para a tabela properties
ALTER TABLE public.properties REPLICA IDENTITY FULL;

-- Adicionar a tabela ao publication para realtime
ALTER publication supabase_realtime ADD TABLE public.properties;