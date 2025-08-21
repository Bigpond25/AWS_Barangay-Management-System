# Certificate of Indigency Location Update

## Changes Made

Updated the Certificate of Indigency print component to reflect the correct location:

### 1. Address Fallback Update
```typescript
// Before:
const applicantAddress = document.applicant_address || 
  document.resident?.complete_address || 
  'Brgy. Sikatuna Village, Samal, Bataan';

// After:
const applicantAddress = document.applicant_address || 
  document.resident?.complete_address || 
  'Brgy. West Triangle, Quezon City';
```

### 2. Issue Location Update
```typescript
// Before:
"Issued this [date] at Barangay Sikatuna Village, Samal, Bataan."

// After:
"Issued this [date] at Barangay West Triangle, Quezon City, Metro Manila."
```

## Impact

- Certificate of Indigency documents will now correctly show they are issued from Barangay West Triangle, Quezon City
- Default address fallback updated for residents without complete address information
- Issue location in the certificate body now reflects the correct barangay

## Print Output

The printed Certificate of Indigency will now display:
- **Issue Location**: "at Barangay West Triangle, Quezon City, Metro Manila"
- **Default Address**: "Brgy. West Triangle, Quezon City" (if resident address not available)

All other functionality remains unchanged.
