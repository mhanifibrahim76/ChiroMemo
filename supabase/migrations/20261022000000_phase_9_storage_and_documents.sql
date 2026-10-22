-- ChiroMemo — Phase 9: Storage & Document Upload Infrastructure
--
-- Migration: 20261022000000_phase_9_storage_and_documents.sql
-- Description:
--   1. Configures the private 'documents' storage bucket with 10MB limit and PDF/TXT mime types.
--   2. Enforces strict Row Level Security (RLS) on storage.objects so authenticated users
--      can only read, write, and delete files inside their own user_id directory: `${auth.uid()}/*`.
--   3. Adds extracted_text column to public.resources for server-extracted text storage.

-- ===========================================================================
-- 1. Create or configure 'documents' storage bucket
-- ===========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Private bucket: access requires authenticated signed URL or RLS check
    10485760, -- 10 MB in bytes
    ARRAY['application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'text/plain'];

-- ===========================================================================
-- 2. Storage RLS Policies for 'documents' bucket
-- ===========================================================================

-- Policy: Authenticated users can view / download their own uploaded files
CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can upload files into their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can update their own files
CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can delete their own files
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ===========================================================================
-- 3. Add extracted_text column to public.resources
-- ===========================================================================

ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS extracted_text text;

-- Also add to public.learning_resources if the table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'learning_resources'
    ) THEN
        ALTER TABLE public.learning_resources ADD COLUMN IF NOT EXISTS extracted_text text;
    END IF;
END $$;

