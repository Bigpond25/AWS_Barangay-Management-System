// ============================================================================
// _components/PrintStyles.tsx - Shared print styles for certificates
// ============================================================================

import React from 'react';

/**
 * Standardized print styles for all certificate templates
 * Implements Letter size (8.5 x 11 inches) with specified margins:
 * - Top Margin: 3.3cm (blank space for letterhead/logo)
 * - Left Margin: 5.2cm (blank space for binding/filing)
 * - Right/Bottom Margins: 2.54cm (1 inch default)
 */
export const PrintStyles: React.FC = () => (
  <style>{`
    @media print {
      @page {
        size: letter; /* 8.5 x 11 inches (21.59 x 27.94 cm) */
        margin-top: 3.3cm;     /* Top margin - blank space for letterhead */
        margin-left: 5.2cm;    /* Left margin - blank space for binding */
        margin-right: 2.54cm;  /* Right margin - 1 inch default */
        margin-bottom: 2.54cm; /* Bottom margin - 1 inch default */
      }
      
      /* Reset all elements for consistent print output */
      * {
        visibility: visible !important;
        color: black !important;
        background: white !important;
        box-shadow: none !important;
        text-shadow: none !important;
        border-color: black !important;
      }
      
      /* Body reset */
      body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Times New Roman', Times, serif !important;
        font-size: 12pt !important;
        line-height: 1.5 !important;
      }
      
      /* Hide print controls and non-printable elements */
      .print\\:hidden,
      .no-print {
        display: none !important;
      }
      
      /* Certificate container */
      .certificate-content {
        page-break-inside: avoid;
        height: auto;
        min-height: 100vh;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      /* Certificate body - contains all document content */
      .certificate-body {
        width: 100%;
        max-width: none;
        padding: 0;
        margin: 0;
        background: white !important;
      }
      
      /* Typography adjustments for print */
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Times New Roman', Times, serif !important;
        margin-top: 0.5em !important;
        margin-bottom: 0.5em !important;
      }
      
      p {
        font-family: 'Times New Roman', Times, serif !important;
        margin-bottom: 0.5em !important;
      }
      
      /* Ensure borders are visible in print */
      .border,
      .border-t,
      .border-b,
      .border-l,
      .border-r,
      .border-2,
      .border-t-2,
      .border-b-2,
      [class*="border"] {
        border-color: black !important;
      }
      
      /* Force black text for all content */
      .text-gray-800,
      .text-gray-700,
      .text-gray-600,
      [class*="text-"] {
        color: black !important;
      }
    }
    
    /* Screen preview styles - simulates print margins */
    @media screen {
      .certificate-content {
        min-height: calc(100vh - 6rem);
      }
      
      .certificate-body {
        /* Visual representation of print margins on screen */
        margin-left: 5.2cm;
        margin-top: 3.3cm;
        padding-right: 2.54cm;
        padding-bottom: 2.54cm;
        /* Add visual indicator of print area */
        border-left: 2px dashed #e5e7eb;
        border-top: 2px dashed #e5e7eb;
        min-height: calc(27.94cm - 3.3cm - 2.54cm); /* Letter height minus margins */
        max-width: calc(21.59cm - 5.2cm - 2.54cm);  /* Letter width minus margins */
      }
      
      /* Show margin guides on screen only */
      .certificate-content::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 5.2cm;
        height: 100vh;
        background: rgba(239, 68, 68, 0.1);
        pointer-events: none;
        z-index: -1;
      }
      
      .certificate-content::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 3.3cm;
        background: rgba(59, 130, 246, 0.1);
        pointer-events: none;
        z-index: -1;
      }
    }
  `}</style>
);

/**
 * Print area dimensions for reference:
 * 
 * Paper Size: Letter (8.5" x 11" / 21.59cm x 27.94cm)
 * 
 * Margins:
 * - Top: 3.3cm (1.30") - Reserved for letterhead/logo
 * - Left: 5.2cm (2.05") - Reserved for binding/filing holes
 * - Right: 2.54cm (1") - Standard margin
 * - Bottom: 2.54cm (1") - Standard margin
 * 
 * Printable Area: 
 * - Width: 13.85cm (5.45") = 21.59 - 5.2 - 2.54
 * - Height: 22.1cm (8.70") = 27.94 - 3.3 - 2.54
 */
export default PrintStyles;
