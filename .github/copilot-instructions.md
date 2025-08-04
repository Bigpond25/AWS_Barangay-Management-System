# AWS Barangay Management System - AI Coding Instructions

## Architecture Overview

This is a full-stack **Barangay (village) management system** with:
- **Backend**: Laravel 12 API (`backend/`) with PostgreSQL
- **Frontend**: React + TypeScript + Vite (`frontend/`) with TailwindCSS
- **Domain**: Philippine local government services (residents, documents, appointments, complaints)

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
Frontend Form → Zod Validation → API Service → Laravel Controller → Eloquent Model → PostgreSQL
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

## Critical Patterns

### Schema-Driven Development
Backend models use dedicated schema classes (`app/Models/Schemas/`) as single source of truth:
```php
// ResidentSchema.php defines constants, fillable fields, casts
protected $fillable; // Loaded from schema
protected $casts;    // Loaded from schema
```

### Frontend API Layer
Follows strict service pattern with Zod validation:
```typescript
// All services extend BaseApiService
export class ResidentService extends BaseApiService {
  async getResident(id: string): Promise<Resident> {
    return this.request(`/residents/${id}`, ResidentSchema);
  }
}
```

### Authentication Flow
- **Laravel Sanctum** tokens in backend
- **React Context** (`AuthContext`) manages frontend state
- Token stored in localStorage/sessionStorage via `tokenStorage` utils

### Audit Trail System
Every model change automatically logged via `LogsActivity` trait:
```php
// Automatically tracks created/updated/deleted with user context
use App\Traits\LogsActivity;
```

## File Organization

### Backend Controllers
- `app/Http/Controllers/Api/` - REST endpoints
- Follow pattern: `{Entity}Controller` with standard CRUD methods
- Public routes in `routes/api.php` for citizen-facing help desk

### Frontend Structure
- `src/services/` - API layer with Zod schemas
- `src/components/{domain}/` - Feature-based organization
- `src/contexts/` - Global state (Auth, Notifications)
- `src/hooks/` - Reusable React Query hooks

### Database Patterns
- All tables use `uuid` primary keys
- Consistent `created_at`, `updated_at`, `deleted_at` columns
- Pivot tables for many-to-many (e.g., household members)

## Integration Points

### API Conventions
- Base URL: `http://127.0.0.1:8000/api`
- Bearer token authentication
- Standardized response format with Laravel API resources
- Pagination follows Laravel's default structure

### Error Handling
- Frontend: Centralized via React Query and notification system
- Backend: Laravel's exception handling with API-friendly responses
- 401 responses trigger automatic logout via `auth-error-handler`

## Special Considerations

### Philippine Context
- Address fields include barangay, municipality, province structure
- Civil status options include Filipino-specific statuses (e.g., "LIVE_IN")
- Document types reflect actual government requirements

### Security Patterns
- Role-based permissions via Spatie Laravel Permission
- Public help desk routes for citizen services
- Protected admin routes require authentication

### Performance Notes
- Laravel caching enabled in production (`config:cache`, `route:cache`)
- Frontend uses React Query for caching and optimistic updates
- Database indexes on frequently queried fields (status, timestamps)

## When Making Changes

1. **Schema changes**: Update both backend Schema class and frontend Zod schema
2. **New endpoints**: Add to both Laravel routes and frontend service classes
3. **Database changes**: Use migrations, update model fillable/casts via schema
4. **Authentication**: All protected routes require Bearer token, public help desk routes exempt
