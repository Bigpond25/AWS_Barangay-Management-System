# Database Enum Constraint Fix for Business Sign Clearance

## Issue Fixed

**Problem**: `SQLSTATE[23514]: Check violation: 7 ERROR: new row for relation "documents" violates check constraint "documents_type_check"`

**Root Cause**: The database constraint didn't include `BUSINESS_SIGN_CLEARANCE` as a valid enum value.

## Analysis

1. **Column Type**: Laravel uses `varchar` with check constraints in PostgreSQL, not native enum types
2. **Constraint**: The `documents_type_check` constraint enforces which values are allowed
3. **Issue**: Our migration didn't properly update the constraint to include the new enum value

## Solution Applied

### ✅ Migration Fix: `2025_08_23_000001_add_business_sign_clearance_fields.php`

**Before (Broken)**:
```php
// Migration tried to use Laravel's enum change() method
$table->enum('type', [..., 'BUSINESS_SIGN_CLEARANCE'])->change();
```

**After (Fixed)**:
```php
// 1. Add new columns first
Schema::table('documents', function (Blueprint $table) {
    $table->string('sign_wordings')->nullable()->after('business_owner');
    $table->string('sign_material')->nullable()->after('sign_wordings');
    $table->string('sign_size')->nullable()->after('sign_material');
});

// 2. Drop and recreate constraint with new enum value
DB::statement('ALTER TABLE documents DROP CONSTRAINT documents_type_check');
DB::statement('ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (((type)::text = ANY ((ARRAY[\'BARANGAY_CLEARANCE\'::character varying, \'CERTIFICATE_OF_RESIDENCY\'::character varying, \'CERTIFICATE_OF_INDIGENCY\'::character varying, \'BUSINESS_PERMIT\'::character varying, \'COMMUNITY_TAX_CERTIFICATE\'::character varying, \'BIRTH_CERTIFICATE_REQUEST\'::character varying, \'DEATH_CERTIFICATE_REQUEST\'::character varying, \'MARRIAGE_CERTIFICATE_REQUEST\'::character varying, \'FIRST_TIME_JOB_SEEKER\'::character varying, \'SENIOR_CITIZEN_ID\'::character varying, \'PWD_ID\'::character varying, \'TRAVEL_PERMIT\'::character varying, \'BUILDING_PERMIT\'::character varying, \'ELECTRICAL_PERMIT\'::character varying, \'PLUMBING_PERMIT\'::character varying, \'COMPLAINT_CERTIFICATE\'::character varying, \'OTHER\'::character varying, \'BUSINESS_SIGN_CLEARANCE\'::character varying])::text[])))');
```

## Migration Results

### ✅ Database Changes Applied:

1. **New Columns Added**:
   - `sign_wordings` (varchar, nullable)
   - `sign_material` (varchar, nullable) 
   - `sign_size` (varchar, nullable)

2. **Constraint Updated**:
   - Old constraint dropped
   - New constraint created with `BUSINESS_SIGN_CLEARANCE` included
   - All original enum values preserved

3. **Rollback Capability**:
   - Down method restores original constraint
   - Removes the three new columns

## Verification

**✅ Constraint Verification**:
```sql
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint WHERE conname = 'documents_type_check'
```

**Result**: `BUSINESS_SIGN_CLEARANCE` now appears in the constraint definition.

**✅ Columns Verification**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'documents' AND column_name LIKE 'sign_%'
```

**Result**: All three columns (`sign_material`, `sign_size`, `sign_wordings`) present.

## Current Status

🎯 **Form submission should now work!** The database will accept:
- `type: 'BUSINESS_SIGN_CLEARANCE'`
- `sign_wordings: 'Custom business text'`
- `sign_material: 'Tarpaulin Print'`
- `sign_size: '3x2 feet'`

## Notes for Future Enum Changes

When adding new enum values to existing Laravel columns in PostgreSQL:

1. ❌ **Don't use**: `$table->enum('column', [...])->change()`
2. ✅ **Do use**: Raw SQL to drop/recreate check constraints
3. 🔧 **Pattern**: 
   ```php
   DB::statement('ALTER TABLE table_name DROP CONSTRAINT constraint_name');
   DB::statement('ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition)');
   ```

This ensures proper PostgreSQL constraint handling with Laravel migrations.
