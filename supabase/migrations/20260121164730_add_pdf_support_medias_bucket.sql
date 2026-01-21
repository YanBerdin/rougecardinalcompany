-- Migration: Add PDF support to medias bucket
-- Date: 2026-01-21
-- Purpose: Enable PDF file uploads for press releases and media kit
-- Affected: storage.buckets (medias)

-- Update medias bucket to allow PDF files
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf'  -- New: PDF support for press releases
]
where id = 'medias';

-- Increase file size limit to accommodate PDF documents (10MB)
update storage.buckets
set file_size_limit = 10485760  -- 10MB (was 5MB)
where id = 'medias';
