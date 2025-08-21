# Business Permit Print Format Update

## Changes Made ✅

### **1. Updated Print Specifications**

**Before**: Used A4 size with 0.5 inch margins
```css
@media print {
  @page {
    margin: 0.5in;
    size: A4;
  }
}
```

**After**: Now matches other documents with Letter size and standardized margins
```css
@media print {
  @page {
    size: 8.5in 11in;           /* Letter size */
    margin-top: 3.3cm;          /* Standardized top margin */
    margin-left: 5.2cm;         /* Standardized left margin */
    margin-right: 2.54cm;       /* Standard right margin */
    margin-bottom: 2.54cm;      /* Standard bottom margin */
  }
}
```

### **2. Standardized Typography and Layout**

**Font and Styling**:
- **Font Family**: Times New Roman (consistent with other documents)
- **Base Font Size**: 10pt for print, 11pt for content
- **Line Height**: 1.2 for print, 1.3 for content
- **Color**: Black text on white background

**Document Structure**:
- **Header**: Republic of the Philippines header with proper hierarchy
- **Title**: "BARANGAY BUSINESS PERMIT" with underline
- **Content**: Justified text with proper spacing
- **Business Details Box**: Bordered section with transparent background
- **Footer**: Date/OR details on left, signature on right

### **3. Updated Document Container**

**Before**: Used complex flex layouts and multiple wrapper divs
```tsx
<div className="max-w-4xl mx-auto p-8 certificate-content print:p-0">
  <div className="bg-white p-8 shadow-lg print:shadow-none print:p-6">
```

**After**: Uses standardized document container with margin indicators
```tsx
<div className="document-container">
  {/* Content directly in container */}
</div>
```

**Screen Display Features**:
- Visual margin indicators (dashed borders)
- Proper page size simulation
- Shadow effects for better preview

### **4. Simplified Content Structure**

**Header Section**:
```tsx
<div className="document-header">
  <div className="mb-4">
    <h1 className="text-lg font-bold">REPUBLIC OF THE PHILIPPINES</h1>
    <h2 className="text-base font-semibold">PROVINCE OF BATAAN</h2>
    <h3 className="text-base font-semibold">MUNICIPALITY OF SAMAL</h3>
    <h4 className="text-lg font-bold">Brgy. Sikatuna Village</h4>
  </div>
  <div className="border-t-2 border-b-2 border-black py-2 mb-6">
    <h2 className="text-xl font-bold">OFFICE OF THE PUNONG BARANGAY</h2>
  </div>
  <div className="document-title">BARANGAY BUSINESS PERMIT</div>
</div>
```

**Business Details Box**:
```tsx
<div className="business-details-box">
  <h3 className="text-lg font-semibold mb-3 text-center">BUSINESS DETAILS</h3>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ width: '48%' }}>
      <p><strong>Business Name:</strong> {businessName}</p>
      <p><strong>Business Type:</strong> {businessType}</p>
    </div>
    <div style={{ width: '48%' }}>
      <p><strong>Business Owner:</strong> {businessOwner}</p>
      <p><strong>Business Address:</strong> {businessAddress}</p>
    </div>
  </div>
</div>
```

### **5. Removed Obsolete Components**

**Removed**:
- `CertificateHeader` component
- `CertificateFooter` component
- Complex grid layouts
- Excessive wrapper divs

**Simplified to**:
- Inline header structure
- Direct footer implementation
- Streamlined content flow

### **6. Fixed Data Mapping**

**Corrections Made**:
- `document.document_type` → `document.type`
- `document.approved_date` → `document.approved_at`
- Proper fallback values for missing data
- Consistent data extraction patterns

### **7. Consistent Styling Classes**

**New CSS Classes**:
```css
.document-header          /* Standardized header */
.document-title           /* Consistent title styling */
.content-text            /* Justified content paragraphs */
.business-details-box    /* Bordered business info section */
.footer-section          /* Footer layout */
.signature-section       /* Signature area */
.signature-name          /* Official name styling */
.signature-title         /* Position title styling */
```

## Current Status ✅

### **Document Layout**:
1. **Header**: Republic of the Philippines → Province → Municipality → Barangay
2. **Office Title**: "OFFICE OF THE PUNONG BARANGAY" with borders
3. **Document Title**: "BARANGAY BUSINESS PERMIT" (underlined)
4. **Content**: "TO WHOM IT MAY CONCERN" + certification text
5. **Business Details**: Bordered box with business information
6. **Terms**: Compliance and renewal requirements
7. **Purpose**: What the permit is for
8. **Issuance**: Date and location of issuance
9. **Footer**: OR number, fee, date on left; signature on right

### **Print Specifications Met**:
- ✅ **Letter Size**: 8.5 x 11 inches
- ✅ **Top Margin**: 3.3cm
- ✅ **Left Margin**: 5.2cm
- ✅ **Right Margin**: 2.54cm (standard)
- ✅ **Bottom Margin**: 2.54cm (standard)
- ✅ **Font**: Times New Roman
- ✅ **Professional Layout**: Clean, official appearance

### **Consistency with Other Documents**:
- ✅ **Same print specifications** as Certificate of Residency, Certificate of Indigency, Barangay Clearance, Business Sign Clearance
- ✅ **Same font and styling approach**
- ✅ **Same document container structure**
- ✅ **Same margin indicators for screen preview**
- ✅ **Same data mapping patterns**

## Result ✅

The Business Permit document now has:
- **Standardized format** matching all other documents
- **Professional appearance** suitable for official use
- **Consistent user experience** across all document types
- **Proper print specifications** for Letter-size paper
- **Clean, modern design** with proper spacing and typography

**All documents in the system now use the same format specifications!** 🎉
