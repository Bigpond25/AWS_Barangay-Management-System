// ============================================================================
// processDocument/BusinessSignClearanceColoredPrint.tsx - Business Sign Clearance Colored Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import { formatDocumentType } from '@/utils/documentTypeUtils';
import type { Document } from '@/services/documents/documents.types';

const BusinessSignClearanceColoredPrint: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  // Modern TanStack Query data fetching
  const { 
    data: document, 
    isLoading, 
    error 
  } = useDocument(documentId || '', !!documentId);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate('/process-document');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-red-600 mb-6">{error?.message || 'Document not found'}</p>
          <button
            onClick={handleClose}
            className="bg-smblue-400 text-white px-6 py-2 rounded-lg hover:bg-smblue-500 transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  // Validate document type
  if (document.type !== 'BUSINESS_SIGN_CLEARANCE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Business Sign Clearance. Expected: Business Sign Clearance, Got: {formatDocumentType(document.type)}
          </p>
          <button
            onClick={handleClose}
            className="bg-smblue-400 text-white px-6 py-2 rounded-lg hover:bg-smblue-500 transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  // Extract data for display
  const businessName = document.business_name || 'N/A';
  const businessOwner = document.business_owner || document.applicant_name || 'N/A';
  const businessAddress = document.business_address || document.applicant_address || 'N/A';
  const signWordings = document.sign_wordings || 'N/A';
  const signMaterial = document.sign_material || 'N/A';
  const signSize = document.sign_size || 'N/A';
  const certifyingOfficial = document.certifying_official || 'ELMER TIMOTHY J. LIGON';
  const permitNumber = document.document_number ? document.document_number.split('-').pop() : '2897';
  const processingFee = parseFloat(String(document.processing_fee)) || 0;
  
  const dateIssued = document.approved_at ? 
    new Date(document.approved_at).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short', 
      year: '2-digit' 
    }).replace(',', '').replace(' ', '-') : 
    new Date().toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short', 
      year: '2-digit' 
    }).replace(',', '').replace(' ', '-');

  return (
    <>
      <style>{`
        /* Force color printing for all elements */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Print specifications for Letter size (8.5 x 11 inches) */
        @media print {
          @page {
            size: 8.5in 11in;
            margin-top: 3.3cm;
            margin-left: 5.2cm;
            margin-right: 2.54cm;
            margin-bottom: 2.54cm;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 10pt !important;
            line-height: 1.2 !important;
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .document-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            height: auto !important;
            max-height: calc(27.94cm - 3.3cm - 2.54cm) !important;
          }
          
          * {
            visibility: visible !important;
            text-shadow: none !important;
          }
          
          .highlight-name, .highlight-business, .highlight-address {
            background: transparent !important;
            color: black !important;
            border: 1px solid black !important;
          }
          
          .permit-number {
            background: #ffff00 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .description-value {
            background: #90EE90 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        /* Screen styles with visual margin indicators */
        @media screen {
          body {
            font-family: 'Times New Roman', Times, serif;
            background-color: #f5f5f5;
          }
          
          .document-container {
            max-width: 21.59cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            margin-left: calc(5.2cm + 20px);
            margin-top: calc(3.3cm + 20px);
            padding-right: 2.54cm;
            padding-bottom: 2.54cm;
            border-left: 3px dashed #ccc;
            border-top: 3px dashed #ccc;
            min-height: calc(27.94cm - 3.3cm - 2.54cm);
          }
        }
        
        /* Document specific styles */
        .document-header {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .document-title {
          font-size: 16pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        
        .permit-number {
          background: #ffff00;
          color: black;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 13pt;
          display: inline-block;
          margin-bottom: 12px;
          border: 1px solid black;
        }
        
        .company-section {
          margin-bottom: 10px;
        }
        
        .highlight-business {
          background: transparent;
          padding: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 6px;
          border: 1px solid black;
          display: block;
        }
        
        .represented-by {
          text-align: center;
          margin: 6px 0;
          font-style: italic;
          font-size: 11pt;
        }
        
        .highlight-name {
          background: transparent;
          padding: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 6px;
          border: 1px solid black;
          display: block;
        }
        
        .business-address-label {
          text-align: center;
          margin: 6px 0;
          font-size: 11pt;
        }
        
        .highlight-address {
          background: transparent;
          padding: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 15px;
          border: 1px solid black;
          display: block;
        }
        
        .clearance-text {
          text-align: justify;
          margin-bottom: 10px;
          line-height: 1.3;
          font-size: 11pt;
        }
        
        .sign-description {
          margin-bottom: 10px;
        }
        
        .sign-description-title {
          text-align: center;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-size: 13pt;
        }
        
        .description-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .description-table td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: top;
          font-size: 11pt;
        }
        
        .description-label {
          width: 100px;
          font-weight: bold;
          background: transparent;
          border: 1px solid black;
        }
        
        .description-value {
          background: #90EE90;
          font-weight: bold;
          border: 1px solid black;
        }
        
        .terms-section {
          margin-bottom: 8px;
        }
        
        .terms-title {
          text-align: center;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 6px;
          font-size: 12pt;
        }
        
        .terms-list {
          text-align: justify;
          line-height: 1.2;
          font-size: 10pt;
        }
        
        .terms-list ol {
          padding-left: 18px;
          margin: 0;
        }
        
        .terms-list li {
          margin-bottom: 6px;
        }
        
        .issuance-section {
          margin-top: 10px;
          margin-bottom: 10px;
        }
        
        .issuance-text {
          text-align: center;
          margin-bottom: 8px;
          font-size: 11pt;
        }
        
        .date-highlight {
          color: red;
          font-weight: bold;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 8px;
          margin-bottom: 5px;
        }
        
        .fee-section {
          text-align: left;
          font-size: 10pt;
        }
        
        .fee-amount {
          color: red;
          font-weight: bold;
          border: 1px solid #000;
          padding: 3px 8px;
          display: inline-block;
          font-size: 11pt;
        }
        
        .record-number {
          border: 1px solid #000;
          padding: 3px 8px;
          display: inline-block;
          margin-top: 3px;
          font-size: 11pt;
        }
        
        .record-section {
          margin-top: 10px;
        }
        
        .signature-section {
          text-align: right;
        }
        
        .signature-name {
          font-weight: bold;
          font-size: 12pt;
        }
        
        .signature-title {
          font-style: italic;
          font-size: 10pt;
        }
        
        .qr-code {
          width: 60px;
          height: 60px;
          background: transparent;
          border: 1px solid black;
          margin: 8px 0;
          position: relative;
          margin-left: auto;
        }
        
        .qr-code::after {
          content: 'QR CODE';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 7pt;
          text-align: center;
        }
        
        .disclaimer {
          font-size: 7pt;
          text-align: center;
          margin-top: 3px;
          font-style: italic;
          line-height: 1.0;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print Instructions */}
        <div className="fixed top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-3 print:hidden no-print max-w-sm">
          <p className="text-sm text-blue-800 font-medium mb-1">📌 Color Printing Tip</p>
          <p className="text-xs text-blue-700">
            To print with colors, enable "Print backgrounds" or "More settings → Options → Background graphics" in your browser's print dialog.
          </p>
        </div>

        {/* Print Controls */}
        <div className="fixed top-4 right-4 flex space-x-2 print:hidden no-print">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-4 py-2 rounded-lg hover:bg-smblue-500 transition-colors flex items-center space-x-2"
            title="Enable 'Print backgrounds' in your browser's print settings to see colors"
          >
            <FiPrinter className="w-5 h-5" />
            <span>Print Colored Version</span>
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <FiX className="w-5 h-5" />
            <span>Close</span>
          </button>
        </div>

        {/* Document Content */}
        <div className="document-container">
          {/* Document Header */}
          <div className="document-header">
            <div className="document-title">BUSINESS SIGN CLEARANCE</div>
            <div className="permit-number">{permitNumber}</div>
          </div>

          {/* Company Information */}
          <div className="company-section">
            <div className="highlight-business">{businessName.toUpperCase()}</div>
            
            <div className="represented-by">represented by:</div>
            
            <div className="highlight-name">{businessOwner.toUpperCase()}</div>
            
            <div className="business-address-label">with business address at</div>
            
            <div className="highlight-address">{businessAddress.toUpperCase()}</div>
          </div>

          {/* Clearance Text */}
          <div className="clearance-text">
            is hereby granted CLEARANCE to install business signage at the above address
            subject to the terms and conditions stipulated hereunder:
          </div>

          {/* Sign Description */}
          <div className="sign-description">
            <div className="sign-description-title">SIGN DESCRIPTION</div>
            
            <table className="description-table">
              <tbody>
                <tr>
                  <td className="description-label">WORDINGS</td>
                  <td className="description-value">{signWordings.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="description-label">MATERIAL</td>
                  <td className="description-value">{signMaterial.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="description-label">SIZE (LxHxW)</td>
                  <td className="description-value">{signSize.toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <div className="terms-title">TERMS AND CONDITIONS</div>
            
            <div className="terms-list">
              <ol>
                <li>The sign shall be installed in conformity with the provisions of the National Building Code;</li>
                
                <li>The installation shall conform to all the <strong>regulatory requirement</strong> of the Signboard Permit Division of Quezon City, MMDA, DPWH and other laws governing signage installation;</li>
                
                <li>That this clearance is temporary and may be revoked anytime should public safety and interest so demands and in case of violations of the above terms and conditions.</li>
              </ol>
            </div>
          </div>

          {/* Issuance Information */}
          <div className="issuance-section">
            <div className="issuance-text">
              Issued this <span className="date-highlight">{dateIssued}</span> at Quezon City, Metro Manila.
            </div>
          </div>

          {/* Footer with Fee and Signature */}
          <div className="footer-section">
            <div className="fee-section">
              <div>
                <strong>Clearance Fee:</strong><br/>
                <span className="fee-amount">₱ {processingFee.toFixed(2)}</span>
              </div>
              <div className="record-section">
                <strong>Record no.:</strong><br/>
                <span className="record-number">{permitNumber}</span>
              </div>
            </div>
            
            <div className="signature-section">
              <div className="signature-name">{certifyingOfficial.toUpperCase()}</div>
              <div className="signature-title">Punong Barangay</div>
              
              <div className="qr-code"></div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            Note: Not valid if found with erasures, alterations and if without barangay seal and official receipt.
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessSignClearanceColoredPrint;
