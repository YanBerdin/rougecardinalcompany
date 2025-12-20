# Supabase Storage Organization

**Bucket**: `medias`  
**Purpose**: Centralized media storage for all application entities  
**Pattern**: Folder-based organization within single bucket

---

## 📂 Folder Structure

```bash
medias/                          # Root bucket (public)
├── team/                        # Team member photos
│   ├── 1704123456789-photo1.jpg
│   ├── 1704123457890-photo2.jpg
│   └── ...
│
├── spectacles/                  # Spectacle images
│   ├── 1704123458901-hamlet.jpg
│   ├── 1704123459012-macbeth.jpg
│   └── ...
│
├── press/                       # Press releases & articles
│   ├── 1704123460123-release.pdf
│   ├── 1704123461234-article.jpg
│   └── ...
│
└── `[future folders...]`          # Events, venues, etc.
```

---

## 🎯 Design Rationale

### Single Bucket vs. Multiple Buckets

**Decision**: Single `medias` bucket with folder organization

**Rationale**:

✅ **Advantages**:

- Simpler permissions (one RLS policy set)
- Easier to manage (one bucket config)
- Consistent public URL structure
- Better for cross-entity media sharing (if needed)
- Lower cognitive load for developers

❌ **Rejected alternative** (multiple buckets):

- Separate buckets: `team-photos`, `spectacle-images`, `press-files`
- More complex permission management
- Redundant RLS policies
- Harder to move/share media between entities

---

## 🔧 Technical Implementation

### Bucket Configuration

**File**: `supabase/schemas/02c_storage_buckets.sql`

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medias',
  'medias',
  true,              -- Public read access
  5242880,           -- 5MB max
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);
```

**Key settings**:

- `public: true` - Anyone can view images (public read)
- `file_size_limit: 5242880` - 5MB max per file
- `allowed_mime_types` - Only images (JPEG, PNG, WebP, AVIF)

---

### Storage Path Pattern

**Format**: `{folder}/{timestamp}-{filename}`

**Example**:

```typescript
// Input
folder = "spectacles"
filename = "hamlet-poster.jpg"

// Output path
"spectacles/1704123456789-hamlet-poster.jpg"
```

**Implementation**:

```typescript
// lib/actions/media-actions.ts
function generateStoragePath(folder: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${folder}/${timestamp}-${sanitizedFilename}`;
}
```

**Benefits**:

- ✅ Unique filenames (timestamp prefix)
- ✅ Organized by entity type (folder prefix)
- ✅ No collisions (even if same filename uploaded twice)
- ✅ Chronological sorting (timestamp-based)

---

## 🔒 Security & Permissions

### RLS Policies

**File**: `supabase/schemas/02c_storage_buckets.sql`

```sql
-- READ: Anyone can view
create policy "Public read access for medias"
on storage.objects for select
to public
using ( bucket_id = 'medias' );

-- UPLOAD: Authenticated users only
create policy "Authenticated users can upload to medias"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'medias' );

-- UPDATE: Authenticated users can update metadata
create policy "Authenticated users can update medias"
on storage.objects for update
to authenticated
using ( bucket_id = 'medias' )
with check ( bucket_id = 'medias' );

-- DELETE: Admins only
create policy "Admins can delete medias"
on storage.objects for delete
to authenticated
using ( 
  bucket_id = 'medias' 
  and (select public.is_admin())
);
```

**Permission Matrix**:

| Role          | Read | Upload | Update | Delete |
|---------------|------|--------|--------|--------|
| Anonymous     | ✅   | ❌     | ❌     | ❌     |
| Authenticated | ✅   | ✅*    | ✅     | ❌     |
| Admin         | ✅   | ✅     | ✅     | ✅     |

**Additional server-side check via `requireAdmin()` in actions**

---

## 📊 Database Integration

### Media Records Table

**Table**: `medias`  
**Schema**: `supabase/schemas/03_table_medias.sql`

```sql
create table public.medias (
  id bigint generated always as identity primary key,
  storage_path text not null,           -- "spectacles/1704123456789-hamlet.jpg"
  filename text,                        -- "hamlet.jpg"
  mime text,                            -- "image/jpeg"
  size_bytes bigint,                    -- 1048576 (1MB)
  alt_text text,                        -- "Hamlet poster"
  uploaded_by uuid,                     -- auth.users.id
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Relationship**:

```bash
medias.storage_path → storage.objects.name (foreign key conceptually)
```

**Benefits**:

- ✅ Metadata searchable (filename, mime, size)
- ✅ Audit trail (uploaded_by, created_at)
- ✅ Accessibility support (alt_text)
- ✅ Easy cleanup (cascade deletes)

---

## 🚀 Usage Examples

### Upload to Team Folder

```typescript
import { uploadMediaImage } from "@/lib/actions";

const formData = new FormData();
formData.append("file", photoFile);

const result = await uploadMediaImage(formData, "team");

if (result.success) {
  // Storage path: "team/1704123456789-photo.jpg"
  // Public URL: "https://<project>.supabase.co/storage/v1/object/public/medias/team/1704123456789-photo.jpg"
  console.log(result.data.publicUrl);
}
```

---

### Upload to Spectacles Folder

```typescript
const result = await uploadMediaImage(formData, "spectacles");

// Storage path: "spectacles/1704123456789-hamlet.jpg"
// Database record created in medias table
```

---

### Retrieve Media by ID

```typescript
const { data: media } = await supabase
  .from("medias")
  .select("*")
  .eq("id", mediaId)
  .single();

// Construct public URL
const publicUrl = supabase.storage
  .from("medias")
  .getPublicUrl(media.storage_path)
  .data.publicUrl;
```

---

## 🧹 Maintenance Tasks

### Cleanup Orphaned Files

**Scenario**: Files in Storage but no database record

**SQL Query**:

```sql
-- Find storage files not in medias table
SELECT name FROM storage.objects
WHERE bucket_id = 'medias'
  AND name NOT IN (SELECT storage_path FROM medias);
```

**Cleanup**:

```typescript
// Delete orphaned files
const { data: orphans } = await supabase.storage
  .from("medias")
  .list("team", { limit: 1000 });

for (const file of orphans) {
  const exists = await supabase
    .from("medias")
    .select("id")
    .eq("storage_path", `team/${file.name}`)
    .single();

  if (!exists.data) {
    await supabase.storage.from("medias").remove([`team/${file.name}`]);
  }
}
```

---

### Cleanup Unused Records

**Scenario**: Database records with no storage file

**SQL Query**:

```sql
-- Find medias records with missing storage files
SELECT m.id, m.storage_path
FROM medias m
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects o
  WHERE o.bucket_id = 'medias'
    AND o.name = m.storage_path
);
```

**Cleanup**:

```sql
DELETE FROM medias
WHERE id IN (
  SELECT m.id
  FROM medias m
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'medias'
      AND o.name = m.storage_path
  )
);
```

---

## 📈 Storage Metrics

### Monitor Usage

**Query**: Total storage by folder

```sql
SELECT 
  SPLIT_PART(name, '/', 1) as folder,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_bytes,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
WHERE bucket_id = 'medias'
GROUP BY folder
ORDER BY total_bytes DESC;
```

**Example output**:

```bash
folder      | file_count | total_bytes | total_size
------------|------------|-------------|------------
spectacles  | 15         | 12582912    | 12 MB
team        | 8          | 5242880     | 5 MB
press       | 3          | 2097152     | 2 MB
```

---

### Storage Quotas

**Current limits** (Supabase Free tier):

- Total storage: 1GB
- File uploads: Unlimited (within storage quota)
- Bandwidth: 2GB/month

**Monitoring**: Set up alerts when approaching limits

```typescript
// Check storage usage via Supabase API
const { data } = await supabase.storage.from("medias").list();
const totalSize = data.reduce((sum, file) => sum + file.metadata.size, 0);

if (totalSize > 900_000_000) { // 900MB
  console.warn("Storage approaching limit!");
}
```

---

## 🔮 Future Enhancements

### Phase 1: Optimization

- [ ] Image compression on upload
- [ ] Automatic thumbnail generation
- [ ] WebP conversion for better compression
- [ ] CDN integration (Cloudflare/CloudFront)

### Phase 2: Advanced Features

- [ ] Video support (separate folder: `videos/`)
- [ ] Document storage (`documents/`)
- [ ] Temporary uploads (`temp/` with TTL)
- [ ] Media versioning (keep history)

### Phase 3: Scale

- [ ] Multi-region storage replication
- [ ] Offload to S3/GCS for long-term archival
- [ ] Implement media library search (full-text)
- [ ] Usage analytics dashboard

---

## 🐛 Troubleshooting

### Issue 1: Upload fails with "Bucket not found"

**Cause**: Migration not run or bucket deleted

**Fix**:

```bash
# Re-run storage bucket migration
psql $DATABASE_URL < supabase/schemas/02c_storage_buckets.sql
```

---

### Issue 2: Files not appearing in Storage UI

**Cause**: Files uploaded but not visible in Supabase Dashboard

**Possible reasons**:

1. RLS policy blocking admin view (check policies)
2. Folder filter in Dashboard (clear filters)
3. Cache issue (hard refresh browser)

**Debug**:

```sql
-- Check if files exist in raw storage
SELECT * FROM storage.objects WHERE bucket_id = 'medias' LIMIT 10;
```

---

### Issue 3: Public URLs return 404

**Cause**: Bucket not marked as public

**Fix**:

```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'medias';
```

---

## 📚 References

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [actions_readme](../../../lib/actions/actions_readme.md)
- [Storage Schema](../../../supabase/schemas/02c_storage_buckets.sql)

---

**Maintained by**: Engineering Team  
**Last Updated**: December 2024  
**Next Review**: Q1 2025 (post-v2.0 release)
