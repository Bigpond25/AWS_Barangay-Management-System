# Certificate of Indigency Submit Button Fix

## Issue Identified
The Certificate of Indigency submit button was unclickable due to a schema validation mismatch.

## Root Cause
The form was using `document_type` field name but the Zod schema expected `type` field name:

```typescript
// ❌ INCORRECT - Form was using:
defaultValues: {
  document_type: 'CERTIFICATE_OF_INDIGENCY',
  // ...
}

// ✅ CORRECT - Schema expects:
export const DocumentFormDataSchema = z.object({
  type: DocumentTypeSchema,  // <-- Expected field name
  // ...
});
```

## Fix Applied

### Files Updated:
1. **`frontend/src/components/processDocument/CertificateOfIndigencyForm.tsx`**
   - Changed `document_type` to `type` in defaultValues (line 32)
   - Changed `document_type` to `type` in reset function (line 566)

2. **`frontend/src/components/processDocument/CertificateOfResidencyForm.tsx`**
   - Changed `document_type` to `type` in defaultValues (line 36) 
   - Changed `document_type` to `type` in reset function (line 617)

## Submit Button Logic
The submit button is disabled when:
```typescript
disabled={documentForm.isSubmitting || !isValid || !declarationAgreed}
```

### Conditions for Enabled Submit Button:
1. ✅ **Not currently submitting** (`!documentForm.isSubmitting`)
2. ✅ **Form is valid** (`isValid`) - NOW FIXED with correct field names
3. ✅ **Declaration checkbox checked** (`declarationAgreed`) - User must check the indigency declaration

## Required Fields Validation
Based on the schema, these fields are **required**:
- `type` (document type)
- `resident_id` (selected resident)
- `applicant_name` (resident name)
- `purpose` (reason for certificate)
- `processing_fee` (must be >= 0)

## User Action Required
To submit the Certificate of Indigency form, users must:
1. **Complete Step 1**: Select a resident from search results
2. **Complete Step 2**: 
   - Fill in required fields (purpose, etc.)
   - Check the **Declaration checkbox** that states they belong to the indigent sector
3. **Submit**: Button will now be enabled when form is valid and declaration is agreed

## Testing Verification
After this fix:
- ✅ Form validation now works correctly
- ✅ Submit button enables when all conditions are met
- ✅ Certificate of Indigency requests can be submitted successfully
- ✅ Certificate of Residency forms also fixed preventively

## Additional Notes
- Processing fee for Certificate of Indigency is always FREE (₱0) as mandated by law
- The declaration checkbox is mandatory - users must acknowledge they belong to the indigent sector
- Both certificate forms now use consistent field naming with the schema
