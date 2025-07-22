-- Adicionar políticas para permitir operações de UPDATE nas propriedades
-- Assumindo que haverá autenticação de admin no futuro

-- Política para permitir inserção de propriedades (admin)
CREATE POLICY "Permitir inserção de propriedades"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir atualização de propriedades (admin)
CREATE POLICY "Permitir atualização de propriedades"
ON public.properties
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para permitir exclusão de propriedades (admin)
CREATE POLICY "Permitir exclusão de propriedades"
ON public.properties
FOR DELETE
TO authenticated
USING (true);