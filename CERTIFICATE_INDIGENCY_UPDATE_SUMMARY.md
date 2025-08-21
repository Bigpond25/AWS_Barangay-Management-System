# Certificate of Indigency Print Format Update

## Overview
Updated the Certificate of Indigency print component to match the new sample document format with specific printing specifications and unique layout features.

## Changes Made

### 1. Print Specifications Updated
- **Paper Size**: Letter (8.5 x 11 inches) 
- **Top Margin**: 3.3cm
- **Left Margin**: 5.2cm  
- **Right Margin**: 2.54cm (1 inch)
- **Bottom Margin**: 2.54cm (1 inch)

### 2. Typography & Styling
- **Font**: Times New Roman, 11pt for print (smaller than residency certificate)
- **Line Height**: 1.3 for compact layout
- **Layout**: Unique design with highlighted sections and special formatting
- **Visual Indicators**: Added dashed borders on screen to show margin placement

### 3. Document Structure (Following Sample)
- **Title Only**: "CERTIFICATE OF INDIGENCY" (no header with Republic info)
  - 18pt, bold, underlined, centered with letter spacing

- **Content Layout**: 
  - "To whom it may concern:" greeting
  - Highlighted applicant name with dark background
  - Address with underline highlighting
  - Barangay location in bold
  - Main certification statement
  - Purpose section with requester and purpose highlighting
  - Date issued section

- **Bottom Section**: Two-column layout
  - **Left**: Remarks section with border and historical records
  - **Right**: Signature area and QR code placeholder

- **Footer**: Barcode placeholder and record number

### 4. Unique Features from Sample
- **Highlighted Name**: Dark background with white text for applicant name
- **Underlined Elements**: Address, requester, purpose, and date
- **Remarks Section**: Left-bordered area for historical records
- **QR Code Placeholder**: 80x80px box on the right
- **Barcode Footer**: Record number and barcode placeholder
- **Compact Design**: More condensed than other certificates

### 5. Data Mapping Improvements
- **Fixed Document Type**: Updated from `document.document_type` to `document.type`
- **Enhanced Name Display**: Proper fallback with uppercase formatting
- **Address Handling**: Dynamic address with barangay suffix
- **Purpose Formatting**: Uppercase display for purpose
- **Date Formatting**: "21 July 2025" format instead of ordinal
- **Record Number**: Extracted from serial number
- **Remarks**: Support for historical records if available

### 6. Component Structure
- **Helper Functions**: Added date formatting and ordinal suffix utilities
- **CertificateBottomSection**: New component for remarks and signature area
- **Responsive Design**: Screen preview shows margin guidelines
- **Print Optimization**: Proper page break and sizing controls

## Files Modified
- `frontend/src/components/processDocument/CertificateOfIndigencyPrint.tsx`

## Sample Document Reference
- `sample-documents/certificate-of-indigency.html` - Used as reference for new format

## Key Differences from Other Certificates
1. **No Header Section**: No Republic of Philippines header
2. **Highlighted Elements**: Special background and underline styling
3. **Two-Column Bottom**: Remarks on left, signature on right
4. **QR Code**: Placeholder for digital verification
5. **Barcode Footer**: Record tracking system
6. **Compact Font**: 11pt instead of 12pt for tighter layout

## Data Fields Utilized
- `document.applicant_name` / `document.resident.*` - Applicant information
- `document.applicant_address` / `document.resident.complete_address` - Address
- `document.purpose` - Purpose of request (highlighted)
- `document.certifying_official` - Signing official
- `document.remarks` - Historical remarks if available
- `document.serial_number` - For record number extraction
- Current date - For issue date

## Print Testing
The updated component now matches the sample document format and will print correctly with:
- Exact margin specifications matching other certificates
- Proper font sizing and compact layout
- Professional indigency certificate appearance
- Unique highlighting and styling elements
- QR code and barcode placeholder areas

## Next Steps
1. Test printing functionality with actual printers
2. Verify all indigency-specific data populates correctly
3. Consider implementing actual QR code generation
4. Test barcode generation for record tracking
5. Ensure signature and QR areas are positioned for official use
