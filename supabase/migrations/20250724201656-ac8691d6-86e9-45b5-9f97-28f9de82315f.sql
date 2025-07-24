-- Create property-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Create policies for property-images bucket
CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Anyone can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images');