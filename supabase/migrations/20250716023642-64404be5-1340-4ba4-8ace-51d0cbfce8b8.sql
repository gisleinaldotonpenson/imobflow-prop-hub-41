-- Adicionar coluna para múltiplas imagens na tabela properties
ALTER TABLE public.properties ADD COLUMN images TEXT[];

-- Migrar dados existentes da image_url para o array images
UPDATE public.properties 
SET images = CASE 
  WHEN image_url IS NOT NULL THEN ARRAY[image_url]
  ELSE ARRAY[]::TEXT[]
END;

-- A coluna image_url será mantida por compatibilidade, mas será atualizada automaticamente
-- com a primeira imagem do array images