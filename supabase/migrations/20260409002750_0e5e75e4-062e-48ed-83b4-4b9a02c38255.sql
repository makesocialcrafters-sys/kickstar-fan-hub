ALTER TABLE public.videos ADD COLUMN thumbnail_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

CREATE POLICY "Users can upload own thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Thumbnails are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'thumbnails');