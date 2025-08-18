# Supabase Storage Integration

This implementation provides a complete Supabase storage solution for the AWS Barangay Management System, replacing local file storage with cloud storage.

## 🚀 Features

- **Dual Storage Support**: Seamlessly switch between local and Supabase storage
- **Bucket Management**: Organized storage with 4 predefined buckets
- **File Validation**: Automatic validation of file types and sizes
- **Migration Support**: Command-line tools to migrate existing files
- **Frontend Integration**: React components and hooks for file uploads
- **API Endpoints**: RESTful API for storage operations
- **Error Handling**: Comprehensive error handling and logging

## 📁 Storage Buckets

| Bucket | Purpose | Access | Max Size | Allowed Types |
|--------|---------|--------|----------|---------------|
| `residents-photos` | Profile photos | Public | 5MB | Images (jpeg, png, gif, webp) |
| `residents-documents` | ID documents | Private | 10MB | PDF, Images |
| `supporting-documents` | Legal documents | Private | 10MB | PDF, Images |
| `public-assets` | System assets | Public | 2MB | Images |

## ⚙️ Setup

### 1. Environment Configuration

**Backend (.env)**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
STORAGE_PROVIDER=supabase
```

**Frontend (.env.local)**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STORAGE_PROVIDER=supabase
```

### 2. Database Migration

```bash
php artisan migrate
```

This adds storage tracking fields to the residents table:
- `photo_storage_provider` - Tracks where the file is stored
- `photo_bucket` - Supabase bucket name
- `photo_path` - File path within bucket
- `photo_migrated_to_supabase` - Migration status flag

### 3. Frontend Dependencies

```bash
npm install @supabase/supabase-js
```

## 🔧 Usage

### Backend API

#### Upload File
```php
POST /api/storage/upload
Content-Type: multipart/form-data

file: (binary)
bucket: residents-photos
path_prefix: profile
public: true
```

#### Delete File
```php
DELETE /api/storage/delete
Content-Type: application/json

{
  "bucket": "residents-photos",
  "path": "profile/123/photo.jpg"
}
```

#### Get File URL
```php
GET /api/storage/url?bucket=residents-photos&path=profile/123/photo.jpg&signed=false
```

### Frontend Integration

#### React Hook
```typescript
import { useFileUpload } from '../hooks/useFileUpload'
import { STORAGE_BUCKETS } from '../services/storage'

function ProfilePhotoUpload({ residentId }) {
  const { uploading, uploadFile, error } = useFileUpload({
    bucket: STORAGE_BUCKETS.RESIDENTS_PHOTOS,
    pathPrefix: `profile/${residentId}`,
    userId: residentId,
    onUploadComplete: (result) => {
      console.log('Upload complete:', result)
    }
  })

  const handleFileSelect = async (file: File) => {
    await uploadFile(file)
  }

  return (
    <div>
      {uploading ? <p>Uploading...</p> : null}
      {error ? <p>Error: {error}</p> : null}
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        accept="image/*"
      />
    </div>
  )
}
```

#### File Upload Component
```typescript
import { FileUpload } from '../components/storage/FileUpload'

function DocumentUpload() {
  return (
    <FileUpload
      bucket={STORAGE_BUCKETS.RESIDENTS_DOCUMENTS}
      pathPrefix="documents"
      accept="application/pdf,image/*"
      maxSize={10 * 1024 * 1024} // 10MB
      onUploadComplete={(result) => {
        if (result.success) {
          console.log('File uploaded:', result.url)
        }
      }}
    />
  )
}
```

### Laravel Service Usage

```php
use App\Contracts\StorageInterface;

class SomeController extends Controller 
{
    public function __construct(private StorageInterface $storage) {}

    public function uploadPhoto(Request $request) 
    {
        $file = $request->file('photo');
        
        $result = $this->storage->uploadFile(
            $file,
            'residents-photos',
            'profile/' . auth()->id(),
            true
        );

        if ($result['success']) {
            return response()->json([
                'url' => $result['url'],
                'path' => $result['path']
            ]);
        }

        return response()->json(['error' => $result['error']], 400);
    }
}
```

## 📦 Migration

Migrate existing local files to Supabase:

### Test Migration (Dry Run)
```bash
php artisan storage:migrate-to-supabase --dry-run
```

### Migrate Profile Photos Only
```bash
php artisan storage:migrate-to-supabase --only-photos
```

### Full Migration
```bash
php artisan storage:migrate-to-supabase --chunk=100
```

### Migration Options
- `--dry-run`: Preview what will be migrated
- `--chunk=N`: Process N records at a time (default: 50)
- `--only-photos`: Only migrate profile photos

## 🧪 Testing

### Test Supabase Connection
```bash
php test-supabase-connection.php
```

### API Test
```bash
curl -X GET http://localhost:8000/test-supabase
```

### Laravel Test
```bash
php artisan test --filter SupabaseStorageTest
```

## 🔒 Security

- **Service Key**: Used for server-side operations (private)
- **Anon Key**: Used for client-side operations (public)
- **Signed URLs**: Private files use time-limited signed URLs
- **Validation**: Files validated on both client and server
- **Permissions**: API routes protected by authentication

## 📂 File Structure

```
backend/
├── app/
│   ├── Contracts/
│   │   └── StorageInterface.php          # Storage interface
│   ├── Services/
│   │   └── SupabaseStorageService.php    # Implementation
│   ├── Http/Controllers/Api/
│   │   └── StorageController.php         # API endpoints
│   └── Console/Commands/
│       └── MigrateFilesToSupabase.php    # Migration command
├── config/
│   └── services.php                      # Supabase config
├── database/migrations/
│   └── *_add_storage_fields_to_residents_table.php
└── routes/
    └── api.php                          # Storage routes

frontend/
├── src/
│   ├── services/storage/
│   │   ├── index.ts                     # Main storage service
│   │   └── supabaseStorage.ts           # Supabase client
│   ├── hooks/
│   │   └── useFileUpload.ts             # Upload hook
│   └── components/storage/
│       └── FileUpload.tsx               # Upload component
└── .env.local                           # Frontend config
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Error**
   - Add SSL options to HTTP requests
   - Use `curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false)` for testing

2. **File Not Found**
   - Check bucket exists in Supabase
   - Verify file path format
   - Ensure proper permissions

3. **Upload Failed**
   - Check file size limits
   - Verify file type restrictions
   - Ensure bucket is writable

4. **Connection Timeout**
   - Increase timeout settings
   - Check network connectivity
   - Verify Supabase project is active

### Debug Commands

```bash
# Test connection
php artisan tinker
>>> app(\App\Contracts\StorageInterface::class)->testConnection()

# Check configuration
>>> config('services.supabase')

# Test file upload
>>> $service = app(\App\Contracts\StorageInterface::class)
>>> $file = new \Illuminate\Http\UploadedFile(...)
>>> $service->uploadFile($file, 'residents-photos', 'test/file.jpg', true)
```

## 📈 Performance

- **Lazy Loading**: Files loaded on demand
- **CDN**: Supabase provides global CDN
- **Caching**: Browser caching for public files
- **Compression**: Automatic image optimization
- **Concurrent Uploads**: Multiple files can be uploaded simultaneously

## 🔄 Switching Storage Providers

To switch between local and Supabase storage:

1. Update environment variables:
   ```env
   STORAGE_PROVIDER=local  # or 'supabase'
   ```

2. The system automatically uses the appropriate service

3. Frontend automatically adapts based on `VITE_STORAGE_PROVIDER`

## 📋 TODO / Future Enhancements

- [ ] Image resizing and thumbnails
- [ ] Batch upload optimization
- [ ] Storage usage analytics
- [ ] Automatic backup system
- [ ] Advanced file search
- [ ] File versioning
- [ ] Integration with other Supabase features (RLS, Auth)

## 🤝 Contributing

When adding new file types or buckets:

1. Update `BUCKET_CONFIG` in `SupabaseStorageService.php`
2. Add validation rules in frontend
3. Update migration command if needed
4. Add tests for new functionality
5. Update this documentation

## 📄 License

This storage implementation is part of the AWS Barangay Management System and follows the same license terms.
