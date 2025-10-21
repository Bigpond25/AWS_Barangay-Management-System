# AWS Barangay Management System - AI Coding Instructions

## Architecture Overview

This is a full-stack **Barangay (village) management system** with:
- **Backend**: Laravel 12 API (`backend/`) with PostgreSQL via Supabase
- **Frontend**: React + TypeScript + Vite (`frontend/`) with TailwindCSS
- **Domain**: Philippine local government services (residents, documents, appointments, complaints)
- **Database**: Remote PostgreSQL on Supabase (Singapore region) with 1+ second latency

**Critical Principle**: Frontend is the source of truth. Backend adapts to frontend requirements, not vice versa.

## Key Domain Concepts

### Core Entities
- **Residents**: Citizens with comprehensive profiles, household relationships
- **Households**: Family units with head-of-household and member relationships  
- **Documents**: Barangay clearances, certificates, business permits with queue processing
- **Help Desk**: Tickets system covering appointments, blotters, complaints, suggestions
- **Officials**: Barangay government structure with hierarchical positions

### Data Flow Pattern
```
Frontend Form → Zod Validation → API Service → Laravel Controller → Eloquent Model → PostgreSQL (Supabase)
```

## Development Workflows

### Backend Setup
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve  # Runs on :8000
```

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev  # Runs on :5173
```

### Database Operations
- Use **Prisma-style migrations**: `php artisan make:migration descriptive_name`
- Models use **UUID primary keys** and **soft deletes**
- **Activity logging** via `LogsActivity` trait tracks all model changes
- Remote database requires **optimized queries** and **indexing strategies**

## Critical Patterns

### Schema-Driven Development
Backend models use dedicated schema classes (`app/Models/Schemas/`) as single source of truth:
```php
// ResidentSchema.php defines constants, fillable fields, casts
protected $fillable; // Loaded from schema
protected $casts;    // Loaded from schema

// PERFORMANCE CRITICAL: Cache expensive schema operations
public static function getFillableFields(): array {
    return static::$cachedFillable ??= [/* fields */];
}
```

### Frontend API Layer
Follows strict service pattern with Zod validation:
```typescript
// All services extend BaseApiService with timeout management
export class ResidentService extends BaseApiService {
  async getResident(id: string): Promise<Resident> {
    return this.request(`/residents/${id}`, ResidentSchema);
  }
}

// API client configured with 30s timeout for remote database
const apiClient = axios.create({
  timeout: 30000, // Critical for Supabase latency
});
```

### Authentication Flow
- **Laravel Sanctum** tokens in backend
- **React Context** (`AuthContext`) manages frontend state
- Token stored in localStorage/sessionStorage via `tokenStorage` utils
- Custom permission middleware with hardcoded role mappings

### Audit Trail System
Every model change automatically logged via `LogsActivity` trait:
```php
// Automatically tracks created/updated/deleted with user context
use App\Traits\LogsActivity;

// PERFORMANCE: Trait uses model event listeners
static::created(function ($model) {
    $model->logActivity('created');
});
```

## Performance Optimization

### Database Performance Patterns
- **Selective Field Loading**: Use `select()` to limit columns in queries
- **Optimized Relationships**: Load only required relationship fields
- **Query Optimization**: Use proper foreign key references and LEFT JOINs
- **Index Strategy**: Add indexes on frequently queried columns (status, timestamps)

### Model Performance
- **Constructor Optimization**: Avoid expensive operations in model constructors
- **Schema Caching**: Cache fillable/casts arrays to prevent repeated schema calls
- **Lazy Loading**: Use `with()` for eager loading to prevent N+1 queries

### Example Optimized Query
```php
// OPTIMIZED: Selective fields + optimized relationships
$query = Document::select([
    'id', 'type', 'status', 'resident_id', /* essential fields */
])->with([
    'resident:id,first_name,last_name,complete_address',
    'processedByUser:id,first_name,last_name,role'
]);
```

## File Organization

### Backend Controllers
- `app/Http/Controllers/Api/` - REST endpoints
- Follow pattern: `{Entity}Controller` with standard CRUD methods
- Public routes in `routes/api.php` for citizen-facing help desk
- **Performance logging** in critical endpoints for debugging

### Frontend Structure
- `src/services/` - API layer with Zod schemas and singleton instances
- `src/services/__shared/` - Base API service, client configuration, auth handling
- `src/components/{domain}/` - Feature-based organization
- `src/contexts/` - Global state (Auth, Notifications)
- `src/hooks/` - Reusable React Query hooks

### Database Patterns
- All tables use `uuid` primary keys
- Consistent `created_at`, `updated_at`, `deleted_at` columns
- Pivot tables for many-to-many (e.g., household members)
- **Foreign key constraints** for relationship optimization

## Integration Points

### API Conventions
- Base URL: `https://barangay-management-system-od8g.onrender.com/api`
- Bearer token authentication via axios interceptors
- Standardized response format with Laravel API resources
- Pagination follows Laravel's default structure
- **Timeout handling** for remote database latency

### Error Handling
- Frontend: Centralized via React Query and notification system
- Backend: Laravel's exception handling with API-friendly responses
- 401 responses trigger automatic logout via `auth-error-handler`
- **Performance debugging** with microtime logging in controllers

### Custom Permission System
- **CheckPermission middleware** with hardcoded role-permission mappings
- Custom implementation instead of Spatie package
- Role-based arrays for permission checking:
```php
protected function userHasPermission($user, $permission): bool {
    $rolePermissions = [
        'admin' => ['*'], // Full access
        'staff' => ['residents.view', 'documents.manage'],
        // etc.
    ];
}
```

## Special Considerations

### Philippine Context
- Address fields include barangay, municipality, province structure
- Civil status options include Filipino-specific statuses (e.g., "LIVE_IN")
- Document types reflect actual government requirements

### Security Patterns
- Role-based permissions via custom middleware
- Public help desk routes for citizen services
- Protected admin routes require authentication
- Activity logging tracks all model changes with user context

### Performance Notes
- **Remote Database Impact**: 1+ second base latency affects all queries
- Laravel caching enabled in production (`config:cache`, `route:cache`)
- Frontend uses React Query for caching and optimistic updates
- Database indexes on frequently queried fields (status, timestamps)
- **Constructor optimization** critical for collection queries

### Debugging Patterns
- **Performance logging** with microtime tracking in controllers
- Debug logging for query analysis and bottleneck identification
- Tinker testing for model performance verification

## When Making Changes

1. **Schema changes**: Update both backend Schema class and frontend Zod schema
2. **New endpoints**: Add to both Laravel routes and frontend service classes
3. **Database changes**: Use migrations, update model fillable/casts via schema
4. **Authentication**: All protected routes require Bearer token, public help desk routes exempt
5. **Performance**: Always consider remote database latency in query design
6. **Model optimization**: Avoid expensive operations in constructors and event listeners
7. **Testing**: Use `php artisan tinker` to verify model performance before deployment
