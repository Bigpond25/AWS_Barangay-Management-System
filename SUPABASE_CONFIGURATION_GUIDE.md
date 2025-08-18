# Supabase Configuration Setup Guide
## AWS Barangay Management System

This guide covers the complete setup of Supabase for file storage migration.

## 1. Supabase Project Setup

### Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in/Sign up with GitHub account
3. Click "New Project"
4. Fill project details:
   - **Name**: `barangay-management-system`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users (e.g., Southeast Asia)
5. Wait for project setup (2-3 minutes)

### Get Project Credentials
After project creation, go to **Settings > API**:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## 2. Storage Bucket Creation

### Navigate to Storage
1. Go to **Storage** in left sidebar
2. Click **"Create a new bucket"**

### Create Required Buckets
Execute these in Supabase SQL Editor or create via Dashboard:

```sql
-- Create residents-photos bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'residents-photos',
  'residents-photos', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Create residents-documents bucket (PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'residents-documents',
  'residents-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- Create supporting-documents bucket (PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'supporting-documents',
  'supporting-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- Create public-assets bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-assets',
  'public-assets',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);
```

## 3. Row Level Security (RLS) Policies

### Enable RLS on Storage
```sql
-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Create Security Policies

#### Residents Photos (Public Read, Authenticated Write)
```sql
-- Public read access for residents photos
CREATE POLICY "Public read access for residents photos" ON storage.objects
FOR SELECT USING (bucket_id = 'residents-photos');

-- Authenticated users can upload resident photos
CREATE POLICY "Authenticated users can upload resident photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'residents-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their photos
CREATE POLICY "Users can update resident photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'residents-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their photos
CREATE POLICY "Users can delete resident photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'residents-photos' AND 
  auth.role() = 'authenticated'
);
```

#### Residents Documents (Private Access)
```sql
-- Users can only access their own documents
CREATE POLICY "Users can access their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'residents-documents' AND
  auth.role() = 'authenticated'
);

-- Users can upload their own documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'residents-documents' AND
  auth.role() = 'authenticated'
);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'residents-documents' AND
  auth.role() = 'authenticated'
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'residents-documents' AND
  auth.role() = 'authenticated'
);
```

#### Supporting Documents (Admin Only)
```sql
-- Admin access to supporting documents
CREATE POLICY "Admin access to supporting documents" ON storage.objects
FOR ALL USING (
  bucket_id = 'supporting-documents' AND
  auth.role() = 'authenticated'
  -- Note: You might want to add additional role checks here
  -- based on your authentication system
);
```

#### Public Assets (Public Read, Admin Write)
```sql
-- Public read access for public assets
CREATE POLICY "Public read access for public assets" ON storage.objects
FOR SELECT USING (bucket_id = 'public-assets');

-- Authenticated users can upload public assets
CREATE POLICY "Authenticated users can upload public assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'public-assets' AND 
  auth.role() = 'authenticated'
);
```

## 4. CORS Configuration

### Configure CORS for Frontend Access
Go to **Settings > API > CORS Configuration** and add:

```json
{
  "origins": [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:5173",
    "https://your-frontend-domain.com",
    "https://admin.barangay.com",
    "https://resident.barangay.com"
  ],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "headers": [
    "authorization",
    "x-client-info",
    "apikey",
    "content-type",
    "x-requested-with"
  ]
}
```

## 5. Environment Variables Setup

### Backend (.env)
Add to your Laravel `.env` file:
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Storage Configuration
STORAGE_PROVIDER=supabase
STORAGE_DEFAULT_BUCKET=residents-photos
```

### Frontend (.env.local)
Add to your React `.env.local` file:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Storage Configuration
VITE_STORAGE_PROVIDER=supabase
VITE_STORAGE_BASE_URL=https://your-project-id.supabase.co/storage/v1
```

## 6. Laravel Services Configuration

### Add to config/services.php
```php
<?php

return [
    // ... other services
    
    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'anon_key' => env('SUPABASE_ANON_KEY'),
        'service_key' => env('SUPABASE_SERVICE_KEY'),
    ],
];
```

### Update config/filesystems.php
```php
<?php

return [
    'default' => env('FILESYSTEM_DISK', 'supabase'),
    
    'disks' => [
        // ... existing disks
        
        'supabase' => [
            'driver' => 'supabase',
            'url' => env('SUPABASE_URL'),
            'key' => env('SUPABASE_SERVICE_KEY'),
            'bucket' => env('STORAGE_DEFAULT_BUCKET', 'residents-photos'),
        ],
    ],
];
```

## 7. Database Tables for File Tracking

### Create file_uploads table for tracking
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'resident', 'document', 'ticket'
    entity_id UUID NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'profile_photo', 'document', 'supporting_document'
    bucket_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_bucket ON file_uploads(bucket_name);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
```

## 8. Testing the Setup

### Test Storage Access
1. **Go to Supabase Dashboard > Storage**
2. **Click on a bucket (e.g., residents-photos)**
3. **Try uploading a test image**
4. **Verify the file appears in the bucket**

### Test API Access
Create a simple test file to verify connectivity:

```javascript
// test-supabase-connection.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test storage access
    const { data, error } = await supabase.storage
      .from('residents-photos')
      .list();
      
    if (error) {
      console.error('Storage test failed:', error);
    } else {
      console.log('Storage connection successful:', data);
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
```

## 9. Security Best Practices

### Environment Security
- **Never expose service key in frontend**
- **Use anon key for frontend operations**
- **Store sensitive keys in secure environment variables**
- **Use different keys for development/production**

### Access Control
- **Review RLS policies regularly**
- **Test file access with different user roles**
- **Implement proper authentication checks**
- **Use signed URLs for temporary access**

### File Validation
- **Validate file types on both frontend and backend**
- **Enforce file size limits**
- **Scan uploaded files for malware**
- **Implement rate limiting for uploads**

## 10. Migration Preparation

### Before Running Migration
1. **Backup current files in Laravel storage**
2. **Create mapping table for old to new URLs**
3. **Test upload/download with small batch**
4. **Verify all environment variables are set**
5. **Check network connectivity to Supabase**

### Migration Checklist
- [ ] Supabase project created
- [ ] All buckets created with correct settings
- [ ] RLS policies implemented and tested
- [ ] CORS configured for frontend domains
- [ ] Environment variables set in both backend/frontend
- [ ] Laravel services configuration updated
- [ ] Database tables created for file tracking
- [ ] Test uploads working
- [ ] File access permissions verified

## 11. Monitoring and Maintenance

### Setup Monitoring
- **Enable Supabase real-time monitoring**
- **Set up alerts for storage quota**
- **Monitor file upload/download performance**
- **Track storage costs and usage**

### Regular Maintenance
- **Review and rotate API keys quarterly**
- **Clean up unused files periodically**
- **Monitor storage bucket sizes**
- **Update RLS policies as needed**
- **Backup critical files to additional storage**

This setup provides a robust, scalable file storage system with proper security controls and monitoring capabilities.
