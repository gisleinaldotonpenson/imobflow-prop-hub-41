-- Habilitar realtime para as tabelas
ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- Adicionar as tabelas ao publication para realtime
ALTER publication supabase_realtime ADD TABLE public.properties;
ALTER publication supabase_realtime ADD TABLE public.leads;