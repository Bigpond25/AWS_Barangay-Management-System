# Certificate of Residency Print Format Update

## Overview
Updated the Certificate of Residency print component to match the new sample document format with specific printing specifications.

## Changes Made

### 1. Print Specifications Updated
- **Paper Size**: Letter (8.5 x 11 inches)
- **Top Margin**: 3.3cm
- **Left Margin**: 5.2cm  
- **Right Margin**: 2.54cm (1 inch)
- **Bottom Margin**: 2.54cm (1 inch)

### 2. Typography & Styling
- **Font**: Times New Roman, 12pt for print
- **Line Height**: 1.4 for optimal readability
- **Layout**: Proper justified text alignment
- **Visual Indicators**: Added dashed borders on screen to show margin placement

### 3. Document Structure
- **Header**: Updated to match sample format
  - Republic of the Philippines
  - Province of Bataan
  - Municipality of Samal
  - Brgy. Sikatuna Village
  - Office of the Punong Barangay (with borders)

- **Body**: Improved text formatting
  - "TO WHOM IT MAY CONCERN:" in bold
  - Proper spacing between paragraphs
  - Important text (names, addresses, purposes) in bold
  - Date formatting with ordinal suffixes (1st, 2nd, 3rd, etc.)

- **Footer**: Enhanced layout
  - Left side: Date issued, O.R. Number, Amount paid
  - Right side: Signature line and certifying official

### 4. Technical Improvements
- Fixed document type validation (`document.type` instead of `document.document_type`)
- Added helper function for ordinal date suffixes
- Moved inline styles to CSS classes
- Enhanced print-specific styling
- Better screen preview with margin visualization

## Files Modified
- `frontend/src/components/processDocument/CertificateOfResidencyPrint.tsx`

## Sample Document Reference
- `sample-documents/certificate-of-residency.html` - Used as reference for new format

## Print Testing
The updated component now matches the sample document format and will print correctly with:
- Exact margin specifications
- Proper font and sizing
- Professional government document appearance
- Consistent layout with official barangay certificates

## Next Steps
1. Test printing functionality with actual printers
2. Verify all document data populates correctly
3. Consider applying similar updates to other certificate types if needed
4. Ensure signature area is properly positioned for hand-signing
