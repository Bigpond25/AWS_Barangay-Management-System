# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack **Barangay (village) management system** with:
- **Backend**: Laravel 12 API (`backend/`) with PostgreSQL via Supabase
- **Frontend**: React + TypeScript + Vite (`frontend/`) with TailwindCSS
- **Domain**: Philippine local government services (residents, documents, appointments, complaints)
- **Database**: Remote PostgreSQL on Supabase (Singapore region) with 1+ second latency

**Critical Principle**: Frontend is the source of truth. Backend adapts to frontend requirements, not vice versa.

## Development Commands

### Backend (Laravel)
```bash
cd backend
composer install                     # Install dependencies
php artisan key:generate             # Generate app key
php artisan migrate --seed           # Run migrations and seeders
php artisan serve                    # Start server (:8000)
composer run dev                     # Full development environment (server + queue + logs + vite)
composer run test                    # Run tests
php artisan test                     # Alternative test command
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm install                          # Install dependencies
npm run dev                          # Start Vite dev server (:5173)
npm run build                        # Build for production
npm run lint                         # Run ESLint
npm run fix                          # Fix linting issues
npm run compile                      # TypeScript compilation
npm run clean                        # Clean compiled files
npm run i18n:scan                    # Scan for i18n translations
```

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

## Critical Patterns

### Schema-Driven Development
Backend models use dedicated schema classes (`backend/app/Models/Schemas/`) as single source of truth:
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
Located in `frontend/src/services/` with strict service pattern and Zod validation:
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

## Performance Optimization

### Database Performance (Critical for Remote DB)
- **Selective Field Loading**: Use `select()` to limit columns in queries
- **Optimized Relationships**: Load only required relationship fields with `with()`
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

### Backend Structure
- `app/Http/Controllers/Api/` - REST endpoints following `{Entity}Controller` pattern
- `app/Models/` - Eloquent models with UUID primary keys and soft deletes
- `app/Models/Schemas/` - Schema classes defining model structure
- `app/Services/` - Business logic services
- `app/Traits/` - Reusable traits (LogsActivity for audit trails)
- `routes/api.php` - API routes (public help desk + protected admin routes)

### Frontend Structure
- `src/services/` - API layer with Zod schemas and singleton instances
- `src/services/__shared/` - Base API service, client configuration, auth handling
- `src/components/{domain}/` - Feature-based organization
- `src/contexts/` - Global state (Auth, Notifications)
- `src/hooks/` - Reusable React Query hooks

## Integration Points

### API Conventions
- Base URL: `http://127.0.0.1:8000/api`
- Bearer token authentication via axios interceptors
- Standardized response format with Laravel API resources
- Pagination follows Laravel's default structure
- **Timeout handling** for remote database latency (30s timeout)

### Error Handling
- Frontend: Centralized via React Query and notification system
- Backend: Laravel's exception handling with API-friendly responses
- 401 responses trigger automatic logout via `auth-error-handler`

### Custom Permission System
- **CheckPermission middleware** with hardcoded role-permission mappings
- Custom implementation instead of Spatie package
- Role-based arrays for permission checking in middleware

## Database Operations

### Migrations and Models
- Use **Prisma-style migrations**: `php artisan make:migration descriptive_name`
- All models use **UUID primary keys** and **soft deletes**
- **Activity logging** via `LogsActivity` trait tracks all model changes
- Consistent `created_at`, `updated_at`, `deleted_at` columns
- Foreign key constraints for relationship optimization

### Performance Considerations
- **Remote Database Impact**: 1+ second base latency affects all queries
- Database indexes on frequently queried fields (status, timestamps)
- **Constructor optimization** critical for collection queries
- Use `php artisan tinker` to verify model performance before deployment

## Testing

### Backend Testing
```bash
cd backend
composer run test                    # Run full test suite
php artisan test                     # Alternative test command
php artisan test --filter TestName  # Run specific test
```

### Frontend Testing
```bash
cd frontend
npm run test                         # Run tests (if configured)
```

## Special Considerations

### Philippine Context
- Address fields include barangay, municipality, province structure
- Civil status options include Filipino-specific statuses (e.g., "LIVE_IN")
- Document types reflect actual government requirements

### Security Patterns
- Role-based permissions via custom middleware
- Public help desk routes for citizen services (`/api/public/*`)
- Protected admin routes require authentication (`/api/*`)
- Activity logging tracks all model changes with user context

## When Making Changes

1. **Schema changes**: Update both backend Schema class and frontend Zod schema
2. **New endpoints**: Add to both Laravel routes and frontend service classes
3. **Database changes**: Use migrations, update model fillable/casts via schema
4. **Authentication**: All protected routes require Bearer token, public help desk routes exempt
5. **Performance**: Always consider remote database latency in query design
6. **Model optimization**: Avoid expensive operations in constructors and event listeners
7. **Testing**: Use `php artisan tinker` to verify model performance before deployment

## Debugging

### Performance Logging
- **Performance logging** with microtime tracking in controllers
- Debug logging for query analysis and bottleneck identification
- Use Laravel Debugbar in development for query analysis

### Common Issues
- Remote database latency: Check timeout configurations
- N+1 queries: Use `with()` for eager loading
- Memory issues: Optimize model constructors and relationships