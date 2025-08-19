# Document Preview Implementation

## Overview

Created a complete document preview system that allows viewing document templates with sample data without needing actual residents or document records in the database.

## Features Implemented

### 🎯 **Preview Components Created**

1. **BarangayClearancePreview** - Sample barangay clearance with mock resident data
2. **CertificateOfIndigencyPreview** - Sample indigency certificate with family details
3. **CertificateOfResidencyPreview** - Sample residency certificate with address info
4. **BusinessPermitPreview** - Sample business permit with company details
5. **DocumentPreviews** - Main dashboard for accessing all preview templates

### 🛣️ **Routes Added**

- `/preview/barangay-clearance` - Barangay Clearance preview
- `/preview/certificate-residency` - Certificate of Residency preview
- `/preview/certificate-indigency` - Certificate of Indigency preview  
- `/preview/business-permit` - Business Permit preview
- `/process-document/previews` - Preview dashboard (main entry point)

### 🎨 **Visual Features**

- **Preview Notice**: Blue banner indicating "Preview Mode" with sample data
- **Print Controls**: Buttons for print preview and closing
- **Sample Data**: Realistic Filipino names, addresses, and document details
- **Margin Guides**: Visual overlays showing print margins on screen
- **Professional Layout**: Same print formatting as actual documents

## Sample Data Used

### Barangay Clearance
```
Name: JUAN DELA CRUZ
Address: Brgy. Sikatuna Village, Samal, Bataan
Purpose: employment purposes
Fee: ₱50.00
Official: MARIA SANTOS
```

### Certificate of Indigency
```
Name: MARIA CRISTINA SANTOS
Address: Block 5, Lot 12, Brgy. Sikatuna Village, Samal, Bataan
Purpose: financial assistance application
Monthly Income: ₱8,500
Family Size: 6 members
Fee: FREE
Official: JOSE RIZAL MERCADO
```

### Certificate of Residency
```
Name: ANTONIO DELA ROSA
Address: Unit 3B, Sikatuna Heights, Brgy. Sikatuna Village, Samal, Bataan
Purpose: school enrollment requirement
Residency Period: fifteen (15) years
Fee: ₱30.00
Official: ELENA CRUZ RODRIGUEZ
```

### Business Permit
```
Business Name: Rosario's Grocery and General Merchandise
Business Type: Retail Store - General Merchandise
Owner: ROSARIO DELA CRUZ SANTOS
Address: Lot 15, Block 3, Purok 2, Brgy. Sikatuna Village, Samal, Bataan
Fee: ₱150.00
Official: MAYOR RICARDO SANTOS
```

## Access Methods

### 1. **Navigation Route**
Access via: `/process-document/previews`
- Shows grid of all available templates
- Includes print specifications
- Direct preview and print buttons for each template

### 2. **Direct URLs**
Access any template directly:
- `/preview/barangay-clearance`
- `/preview/certificate-residency`
- `/preview/certificate-indigency`
- `/preview/business-permit`

### 3. **Print Testing**
Each preview includes:
- "Print Preview" button for immediate printing
- "Close" button to return to main interface
- Browser print preview compatibility (Ctrl+P)

## Technical Implementation

### Shared Components
- **PrintStyles**: Consistent Letter-size print formatting
- **CertificateHeader**: Standard government header
- **CertificateFooter**: Official signature and payment details

### Authentication
- All preview routes protected with `ProtectedRoute`
- Requires `view-documents` permission
- Same security as regular document pages

### File Structure
```
frontend/src/components/processDocument/
├── previews/
│   ├── BarangayClearancePreview.tsx
│   ├── CertificateOfIndigencyPreview.tsx
│   ├── CertificateOfResidencyPreview.tsx
│   └── BusinessPermitPreview.tsx
├── DocumentPreviews.tsx
└── _components/
    └── PrintStyles.tsx
```

## Benefits

1. **Template Testing**: View document layout without real data
2. **Print Verification**: Test print margins and formatting
3. **Design Review**: Evaluate document appearance before deployment
4. **Training**: Show staff what documents will look like
5. **Development**: Quick template iteration and testing

## Usage Examples

### For Administrators
- Review document templates before approving design
- Test print formatting on different printers
- Show examples to staff for training

### For Developers
- Quick template testing during development
- Verify print CSS changes without database setup
- Demo functionality to stakeholders

### For Staff Training
- Show examples of completed documents
- Explain document fields and formatting
- Practice with print procedures

## Print Specifications Applied

All previews use the same Letter-size specifications:
- **Paper**: 8.5 x 11 inches (21.59 x 27.94 cm)
- **Top Margin**: 3.3cm (for letterhead)
- **Left Margin**: 5.2cm (for binding)
- **Right/Bottom**: 2.54cm (standard)
- **Printable Area**: 13.85 x 22.1 cm

## Browser Compatibility

Preview templates work in:
- ✅ Chrome/Chromium
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

Print formatting consistent across all browsers.

## Next Steps

1. **Add More Templates**: Create previews for additional document types
2. **Customization**: Allow editing sample data in previews
3. **Export Options**: Add PDF generation for previews
4. **Comparison Mode**: Side-by-side template comparison
5. **Mobile Optimization**: Improve mobile preview experience
