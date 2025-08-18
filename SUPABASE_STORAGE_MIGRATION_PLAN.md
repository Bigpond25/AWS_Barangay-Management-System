# Supabase Storage Migration Plan
## AWS Barangay Management System

### Overview
This document outlines the complete migration from Laravel's local file storage to Supabase storage buckets for images and documents. The migration will provide better scalability, CDN capabilities, and cloud-native file management.

## Current State Analysis

### Current Implementation
- **Backend**: Laravel Storage facade with local 'public' disk
- **File Types**: Resident photos, documents, supporting documents
- **Storage Path**: `storage/public/residents/photos/`
- **URL Generation**: Manual asset() function with hardcoded paths
- **Frontend**: Hardcoded `STORAGE_BASE_URL` with manual URL construction

### Issues with Current System
1. **Scalability**: Local storage doesn't scale across multiple servers
2. **Performance**: No CDN support for faster global delivery
3. **URL Handling**: Manual URL construction throughout codebase
4. **Backup/Recovery**: Files stored locally without cloud backup
5. **Security**: Limited access control and signed URL capabilities

## Supabase Storage Architecture

### Storage Buckets Structure
```
supabase-project/
├── residents-photos/           # Public bucket for profile photos
│   ├── {resident_id}/
│   │   └── profile.{ext}
├── residents-documents/        # Private bucket for sensitive documents
│   ├── {resident_id}/
│   │   ├── barangay_clearance/
│   │   ├── cedula/
│   │   └── business_permit/
├── supporting-documents/       # Private bucket for blotter/complaint docs
│   ├── {ticket_id}/
│   │   └── {document_name}
└── public-assets/             # Public bucket for general assets
    ├── placeholders/
    └── logos/
```

### Security Policies
```sql
-- Residents Photos Bucket (Public)
CREATE POLICY "Public read access for residents photos" ON storage.objects
FOR SELECT USING (bucket_id = 'residents-photos');

CREATE POLICY "Authenticated users can upload resident photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'residents-photos' AND 
  auth.role() = 'authenticated'
);

-- Residents Documents Bucket (Private)
CREATE POLICY "Users can only access their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'residents-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Supporting Documents Bucket (Admin only)
CREATE POLICY "Admin access to supporting documents" ON storage.objects
FOR ALL USING (
  bucket_id = 'supporting-documents' AND
  auth.jwt()->>'role' = 'admin'
);
```

## Implementation Plan

### Phase 1: Supabase Setup & Configuration

#### 1.1 Environment Variables
```bash
# Add to .env files (both backend and frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Frontend specific
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 1.2 Storage Buckets Creation
```javascript
// Supabase Dashboard or CLI commands
const buckets = [
  { name: 'residents-photos', public: true },
  { name: 'residents-documents', public: false },
  { name: 'supporting-documents', public: false },
  { name: 'public-assets', public: true }
];
```

### Phase 2: Backend Laravel Integration

#### 2.1 Install Supabase PHP Client
```bash
composer require supabase/supabase-php
```

#### 2.2 Create Supabase Storage Service
**File**: `app/Services/SupabaseStorageService.php`
- Wrapper around Supabase PHP client
- Methods: upload, delete, getSignedUrl, getPublicUrl
- File validation and type detection
- Automatic folder organization by entity type

#### 2.3 Update Storage Configuration
**File**: `config/filesystems.php`
- Add Supabase disk configuration
- Maintain backward compatibility with existing local disk

#### 2.4 Create Storage Interface
**File**: `app/Contracts/StorageInterface.php`
- Abstract storage operations
- Allows switching between local and Supabase
- Supports both public and private file handling

#### 2.5 Update Controllers
**Files to modify**:
- `FileUploadController.php` - Use SupabaseStorageService
- `ResidentController.php` - Update uploadPhoto method
- `DocumentController.php` - Handle document uploads via Supabase

#### 2.6 Update Models
**Files to modify**:
- `Resident.php` - Update profile_photo_url accessor
- `Document.php` - Update file_path accessor  
- `SupportingDocument.php` - Update file_path accessor

### Phase 3: Frontend React Integration

#### 3.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### 3.2 Create Supabase Client Configuration
**File**: `src/services/__shared/_storage/supabase.client.ts`
- Initialize Supabase client with environment variables
- Configure storage bucket settings
- Handle authentication for file operations

#### 3.3 Update Storage Service
**File**: `src/services/__shared/_storage/storage.service.ts`
- Replace hardcoded STORAGE_BASE_URL logic
- Add methods for Supabase storage operations
- Implement automatic URL generation from bucket/path

#### 3.4 Create Storage Utilities
**File**: `src/utils/storageUtils.ts`
- Abstract URL generation logic
- Handle both public and signed URL generation
- Provide fallback mechanisms

#### 3.5 Update Image Utilities
**File**: `src/utils/imageUtils.ts`
- Replace manual URL construction
- Use storage service for URL generation
- Maintain backward compatibility

### Phase 4: Component Updates

#### 4.1 Profile Photo Components
**Files to update**:
- `ProfilePhotoUpload.tsx` - Use new storage service
- `ResidentProfileHeader.tsx` - Update URL generation
- `BarangayOfficialForm.tsx` - Update photo display logic

#### 4.2 Document Upload Components
**Files to update**:
- Document upload forms
- File preview components
- Download link generators

### Phase 5: Database Migration

#### 5.1 Update URL Storage Strategy
```sql
-- Migration to update existing file URLs
UPDATE residents 
SET profile_photo_url = REPLACE(profile_photo_url, '/storage/public/', '')
WHERE profile_photo_url LIKE '%/storage/public/%';

-- Add metadata columns for better file tracking
ALTER TABLE residents ADD COLUMN photo_bucket VARCHAR(255);
ALTER TABLE residents ADD COLUMN photo_path VARCHAR(255);
```

#### 5.2 Batch File Migration Script
**File**: `database/scripts/migrate_files_to_supabase.php`
- Read existing files from local storage
- Upload to appropriate Supabase buckets
- Update database records with new URLs
- Maintain backup of original file paths

## Technical Implementation Details

### Backend Service Example
```php
class SupabaseStorageService implements StorageInterface
{
    public function uploadFile(
        UploadedFile $file, 
        string $bucket, 
        string $path,
        bool $isPublic = false
    ): string {
        // Supabase upload implementation
        // Returns: file URL or signed URL
    }
    
    public function getUrl(string $bucket, string $path, bool $signed = false): string
    {
        // Generate appropriate URL type
    }
    
    public function deleteFile(string $bucket, string $path): bool
    {
        // Delete file from Supabase
    }
}
```

### Frontend Service Example
```typescript
class SupabaseStorageService {
    async uploadFile(
        file: File, 
        bucket: string, 
        path: string
    ): Promise<StorageResult> {
        // Supabase upload with progress tracking
    }
    
    getPublicUrl(bucket: string, path: string): string {
        // Generate public URL
    }
    
    async getSignedUrl(
        bucket: string, 
        path: string, 
        expiresIn: number = 3600
    ): Promise<string> {
        // Generate signed URL for private files
    }
}
```

## Rollout Strategy

### Phase 1: Development Setup (Week 1)
- Set up Supabase project and buckets
- Implement backend storage service
- Create migration scripts

### Phase 2: Backend Integration (Week 2)
- Update controllers and models
- Test file upload/download flows
- Implement URL generation

### Phase 3: Frontend Integration (Week 3)
- Update React components
- Test image displays and uploads
- Verify document operations

### Phase 4: Data Migration (Week 4)
- Run file migration scripts
- Update database records
- Verify data integrity

### Phase 5: Testing & Deployment (Week 5)
- Comprehensive testing
- Performance verification
- Production deployment

## Benefits After Migration

### Performance Improvements
- **CDN Distribution**: Faster global file delivery
- **Optimized Images**: Automatic image optimization and resizing
- **Bandwidth Efficiency**: Reduced server load for file serving

### Security Enhancements
- **Row Level Security**: Fine-grained access control
- **Signed URLs**: Temporary access for sensitive documents
- **Audit Trail**: Built-in access logging

### Scalability Benefits
- **Unlimited Storage**: No local disk space constraints
- **Global Availability**: Files accessible from multiple regions
- **Backup Integration**: Automatic cloud backup and versioning

### Developer Experience
- **Clean URLs**: Consistent URL generation patterns
- **Type Safety**: TypeScript interfaces for all storage operations
- **Error Handling**: Standardized error responses

## Configuration Checklist

### Supabase Dashboard Setup
- [ ] Create storage buckets with proper names
- [ ] Configure bucket policies for security
- [ ] Set up CORS policies for frontend access
- [ ] Configure webhook endpoints for file events

### Backend Configuration
- [ ] Add Supabase credentials to .env
- [ ] Install and configure Supabase PHP client
- [ ] Create storage service implementations
- [ ] Update controller methods

### Frontend Configuration  
- [ ] Install Supabase JavaScript client
- [ ] Configure environment variables
- [ ] Update storage service implementations
- [ ] Test file upload flows

### Database Updates
- [ ] Run URL format migration
- [ ] Add metadata columns
- [ ] Create file migration script
- [ ] Verify data integrity

This migration will modernize the file storage system while maintaining backward compatibility and improving performance, security, and scalability.
