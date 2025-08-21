# Database Column Fix for Certificate of Indigency

## Issue Identified
When submitting a Certificate of Indigency form, the following database error occurred:
```
SQLSTATE[42703]: Undefined column: 7 ERROR: column "monthly_income" of relation "documents" does not exist
```

## Root Cause Analysis

### Column Name Mismatch
The system had inconsistent field naming across different layers:

1. **Database Migration** (original): `family_monthly_income`
2. **Schema Definition**: `monthly_income` 
3. **Frontend Form**: `monthly_income`
4. **API Expected**: `monthly_income`

### The Problem
- ✅ Frontend form was correctly sending `monthly_income`
- ✅ Schema validation was expecting `monthly_income`
- ❌ Database table only had `family_monthly_income` column
- ❌ Insert failed when trying to insert into non-existent `monthly_income` column

## Fix Applied

### Migration Created: `2025_08_22_000001_add_missing_indigency_columns.php`

```php
Schema::table('documents', function (Blueprint $table) {
    // Add monthly_income column as expected by schema and frontend
    $table->decimal('monthly_income', 10, 2)->nullable()->after('indigency_reason');
});
```

### Migration Executed Successfully
```
INFO  Running migrations.  
2025_08_22_000001_add_missing_indigency_columns ............................................. 396.23ms DONE
```

## Current Database Schema Status

### Certificate of Indigency Related Columns:
- ✅ `indigency_reason` (text, nullable) - Reason for indigency
- ✅ `monthly_income` (decimal 10,2, nullable) - **NEW COLUMN ADDED**
- ✅ `family_monthly_income` (decimal 10,2, nullable) - Original column (kept for compatibility)
- ✅ `family_size` (integer, nullable) - Number of family members

## Data Flow Verification

### Frontend → Backend → Database:
1. **Frontend Form**: Collects `monthly_income` and `family_size`
2. **Schema Validation**: Validates `monthly_income` and `family_size` 
3. **Database Insert**: Now successfully inserts into `monthly_income` and `family_size` columns
4. **API Response**: Returns saved document data

## Testing Status

### Expected Results After Fix:
- ✅ Certificate of Indigency form submissions should work
- ✅ Monthly income data should be saved correctly
- ✅ Family size data should be saved correctly
- ✅ Form validation continues to work properly
- ✅ Print documents should display income information correctly

## Compatibility Notes

- **Dual Column Support**: Both `monthly_income` and `family_monthly_income` exist for compatibility
- **Future Cleanup**: Consider consolidating to single column in future schema updates
- **No Data Loss**: Existing data in `family_monthly_income` remains intact

## Related Files Updated

1. **Migration**: `backend/database/migrations/2025_08_22_000001_add_missing_indigency_columns.php`
2. **Schema**: `backend/app/Models/Schemas/DocumentSchema.php` (already correct)
3. **Frontend**: Certificate of Indigency form (already correct)

## Next Steps for Testing

1. Try submitting a Certificate of Indigency form
2. Verify the data is saved correctly in the database
3. Check that the print document displays the income information
4. Confirm no regression in other document types
