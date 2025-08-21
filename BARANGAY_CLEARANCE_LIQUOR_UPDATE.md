# Barangay Clearance (Liquor) Update Summary

## Overview
Updated the Barangay Clearance system to specifically handle liquor license clearances, matching the sample document format provided.

## Changes Made

### 1. Navigation Updates
- **Sidebar Menu**: Changed "Barangay Clearance" to "Barangay Clearance (Liquor)"
- **Document Type Dropdown**: Updated label in ProcessDocument component
- **Form Title**: Changed to "Barangay Clearance (Liquor) Request"

### 2. Form Updates (BarangayClearanceForm.tsx)

#### New Fields Added:
- **Business/Establishment Name** (required)
- **Business Owner/Applicant** (required)
- **Business Address** (required)

#### Fields Removed:
- Purpose dropdown (fixed to LIQUOR_LICENSE)
- Years of Residency field

#### Default Values Updated:
```typescript
{
  type: 'BARANGAY_CLEARANCE',
  purpose: 'LIQUOR_LICENSE',
  processing_fee: 0, // Free for liquor clearance
  clearance_purpose: 'LIQUOR_LICENSE',
  clearance_type: 'LIQUOR',
  business_name: '',
  business_address: '',
  business_owner: '',
  // ... other fields
}
```

### 3. Print Component Updates (BarangayClearancePrint.tsx)

#### Complete Redesign:
- **Layout**: Matches exact sample document format
- **Title**: "BARANGAY CLEARANCE (LIQUOR)"
- **Reference Section**: Includes board address and reference number
- **Content Structure**:
  - Applicant name (business owner)
  - Business establishment name
  - Business address
  - Ordinance reference
  - Four certification conditions
  - Date issued with underline
  - Signature section
  - Footer with CTC, OR number, and barcode placeholder

#### Print Specifications:
- **Paper Size**: Letter (8.5 x 11 inches)
- **Top Margin**: 3.3cm
- **Left Margin**: 5.2cm
- **Right/Bottom Margins**: 2.54cm (1 inch)
- **Font**: Times New Roman, 9pt for print

### 4. Data Mapping
- `business_owner` → Displayed as applicant name
- `business_name` → Displayed as establishment name
- `business_address` → Displayed as business location
- `document_number` → Used for reference number
- `serial_number` → Used for OR number
- `certifying_official` → Defaults to "ELMER TIMOTHY J. LIGON"

## Form Workflow

### Step 1: Select Resident
- Search and select a resident (unchanged)
- Resident selection remains the same

### Step 2: Fill Liquor Clearance Details
1. **Business Information**:
   - Business/Establishment Name
   - Business Owner/Applicant
   - Business Address

2. **Administrative Details**:
   - Valid ID Presented
   - Certifying Official
   - Additional Information (optional)

3. **Processing**:
   - Processing fee: FREE (₱0.00)
   - Purpose: Fixed to LIQUOR_LICENSE

### Step 3: Success
- Shows confirmation with document number
- Option to print or submit another request

## Testing Checklist

1. ✅ Navigate to Process Document → Barangay Clearance (Liquor)
2. ✅ Select a resident
3. ✅ Fill in business information:
   - Business Name
   - Business Owner
   - Business Address
4. ✅ Select Valid ID and Certifying Official
5. ✅ Submit the form
6. ✅ Approve the document in queue
7. ✅ Print the clearance - verify format matches sample

## Database Compatibility

The implementation uses existing database fields:
- `business_name` - Already in documents table
- `business_address` - Already in documents table  
- `business_owner` - Already in documents table
- `clearance_type` - Set to 'LIQUOR'
- `clearance_purpose` - Set to 'LIQUOR_LICENSE'

No database migrations required.

## Print Output Features

- **Highlighted Fields**: Business owner, name, and address have tan background
- **Reference Number**: Orange box with black border
- **Conditions List**: Four standard conditions for liquor establishments
- **Footer Layout**: Split between left (CTC info) and right (OR/barcode)
- **Visual Margins**: Dashed lines on screen show print margins

## Future Enhancements

Consider adding:
1. Barcode generation for the barcode placeholder
2. QR code for document verification
3. Configurable ordinance references
4. Distance calculation from schools (condition #1)
5. Multiple clearance types (not just liquor)
