-- Create public storage bucket for price report images (idempotent)
insert into storage.buckets (id, name, public)
values ('price-reports', 'price-reports', true)
on conflict (id) do nothing;

-- Public read policy (idempotent via existence check)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for price-reports'
  ) THEN
    CREATE POLICY "Public read for price-reports"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'price-reports');
  END IF;
END $$;

-- Authenticated users can upload to their own folder (userId as first folder segment)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to price-reports in their own folder'
  ) THEN
    CREATE POLICY "Users can upload to price-reports in their own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Authenticated users can update their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own price-reports files'
  ) THEN
    CREATE POLICY "Users can update their own price-reports files"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Authenticated users can delete their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own price-reports files'
  ) THEN
    CREATE POLICY "Users can delete their own price-reports files"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'price-reports' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;