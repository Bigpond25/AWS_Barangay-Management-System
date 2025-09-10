// ============================================================================
// processDocument/RetirementColoredPrint.tsx - Retirement/Cessation/Dissolution Certificate Print (Colored Version)
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import { useResident } from '@/services/residents/useResidents';
import type { Document } from '@/services/documents/documents.types';

const RetirementColoredPrint: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  // Modern TanStack Query data fetching - same pattern as CertificateOfResidencyForm
  const { 
    data: document, 
    isLoading: isLoadingDocument, 
    error: documentError 
  } = useDocument(documentId || '', !!documentId);

  // Fetch resident data separately using the resident_id from the document
  const { 
    data: resident, 
    isLoading: isLoadingResident, 
    error: residentError 
  } = useResident(document?.resident_id || '', !!document?.resident_id);

  const isLoading = isLoadingDocument || isLoadingResident;
  const error = documentError || residentError;

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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Document Not Found</h3>
          <p className="text-red-600 mb-6">
            {error?.message || 'The requested document could not be found or loaded.'}
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

  // Validate document type
  if (document.type !== 'RETIREMENT_CESSATION_DISSOLUTION') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Retirement/Cessation/Dissolution Certificate. Expected: Retirement/Cessation/Dissolution, Got: {document.type.replace(/_/g, ' ')}
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

  // Extract data for the certificate
  console.log('Document data:', document);
  console.log('Resident data:', resident);
  
  // Business information from document
  const businessName = document?.business_name || 'N/A';
  const businessAddress = document?.business_address || 'Brgy. West Triangle, Quezon City';
  const businessOwner = document?.business_owner || document?.applicant_name || 'N/A';
  const ownershipType = document?.ownership_type || 'N/A';
  
  // Extract business category from business_type field
  const businessCategory = document?.business_type || 'N/A';
  
  // Retirement/cessation date
  const retirementDate = document?.retirement_date ? 
    new Date(document.retirement_date).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    }) : 
    'N/A';

  // Certifying official
  const certifyingOfficial = document.certifying_official || 'ELMER TIMOTHY J. LIGON';
  
  // Date issued
  const dateIssued = document.approved_date ? 
    new Date(document.approved_date).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    }) : 
    new Date().toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    });

  // Generate record number specific to retirement documents
  const getRetirementRecordNumber = (document: any): string => {
    // First try to extract numbers from serial_number if it exists
    if (document.serial_number) {
      const numericPart = document.serial_number.replace(/\D/g, '');
      if (numericPart) {
        return numericPart.padStart(4, '0');
      }
    }
    
    // For retirement documents, we want a sequential number based on document type
    // This would ideally come from backend as a count of RETIREMENT_CESSATION_DISSOLUTION documents
    // For now, use document ID but you should update backend to provide proper sequential numbering
    return (document.id || 1).toString().padStart(4, '0');
  };

  const recordNumber = getRetirementRecordNumber(document);
  const processingFee = document?.processing_fee || 500;

  // Date Approved (DA) and Last Compliance (LC) from database
  const dateApproved = document?.date_approved ? 
    new Date(document.date_approved).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    }) : 
    '_________';
    
  const lastCompliance = document?.last_compliance ? 
    new Date(document.last_compliance).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    }) : 
    '_________';

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
          }
          
          * {
            visibility: visible !important;
            text-shadow: none !important;
          }
          
          .field-box {
            background: #f0f8e0 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .address-field {
            background: #f0f8e0 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .owner-field {
            background: #f0f8e0 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .small-box {
            background: #f0f8e0 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .record-field {
            background: #f0f8e0 !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }   

          .date-field {
            background: #f0f8e0 !important;
            color: #d32f2f !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

         
          
          .remarks-box {
            background: #f9f9f9 !important;
            color: black !important;
            border: 1px solid black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        /* Screen styles with proper print preview margins */
        @media screen {
          body {
            font-family: 'Times New Roman', Times, serif;
            background-color: #f5f5f5;
          }
          
          .document-container {
            /* Simulate Letter size paper */
            width: 8.5in;
            min-height: 11in;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            
            /* Apply the same margins as print */
            padding-top: 3.3cm;     /* Top margin for letterhead space */
            padding-left: 5.2cm;    /* Left margin for binding */
            padding-right: 2.54cm;  /* Right margin */
            padding-bottom: 2.54cm; /* Bottom margin */
            
            /* Visual paper simulation */
            position: relative;
            border: 1px solid #ddd;
          }
          
          /* Optional: Visual margin guides */
          .document-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5.2cm;
            height: 100%;
            border-right: 1px dashed #ccc;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.02) 10px,
              rgba(0,0,0,0.02) 20px
            );
            pointer-events: none;
            z-index: 1;
          }
          
          .document-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3.3cm;
            border-bottom: 1px dashed #ccc;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.02) 10px,
              rgba(0,0,0,0.02) 20px
            );
            pointer-events: none;
            z-index: 1;
          }
          
          /* Ensure content appears above margin indicators */
          .document-container > * {
            position: relative;
            z-index: 2;
          }
        }
        
        .title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 30px;
          text-decoration: underline;
          letter-spacing: 1px;
        }
        
        .greeting {
          margin-bottom: 20px;
          font-size: 10pt;
        }
        
        .certification-text {
          margin-bottom: 20px;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .form-section {
          margin-bottom: 15px;
        }
        
        .field-label {
          font-size: 9pt;
          margin-bottom: 2px;
          font-style: italic;
        }
        
        .field-box {
          border: 1px solid #000;
          padding: 4px 8px;
          background-color: #f0f8e0;
          min-height: 20px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .address-field {
          border: 1px solid #000;
          padding: 4px 8px;
          background-color: #f0f8e0;
          min-height: 20px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .owner-field {
          border: 1px solid #000;
          padding: 4px 8px;
          background-color: #f0f8e0;
          min-height: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .info-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .info-left {
          flex: 1;
        }
        
        .info-right {
          flex: 1;
        }
        
        .small-field-group {
          display: flex;
          gap: 10px;
          margin-bottom: 5px;
        }
        
        .small-field {
          flex: 1;
        }
        
        .small-label {
          font-size: 8pt;
          margin-bottom: 2px;
        }
        
        .small-box {
          border: 1px solid #000;
          padding: 3px 6px;
          background-color: #f0f8e0;
          min-height: 16px;
          font-weight: bold;
          text-align: center;
        }
        
        .record-field {
          background-color: #e0e0e0;
        }
        
        .date-field {
          background-color: #f0f8e0;
          color: #d32f2f;
        }
        
        .purpose-text {
          margin: 20px 0;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .issuance-section {
          margin: 30px 0 20px 0;
          text-align: center;
          font-size: 10pt;
        }
        
        .date-issued {
          font-weight: bold;
          text-decoration: underline;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 20px;
        }
        
        .remarks-section {
          width: 300px;
        }
        
        .remarks-label {
          font-size: 9pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .remarks-box {
          border: 1px solid #000;
          height: 80px;
          background-color: #f9f9f9;
          padding: 4px;
          font-size: 8pt;
        }
        
        .fee-section {
          text-align: center;
          margin-top: 10px;
        }
        
        .fee-amount {
          font-weight: bold;
          font-size: 11pt;
        }
        
        .official-section {
          text-align: center;
          width: 200px;
        }
        
        .official-name {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .official-title {
          font-size: 9pt;
          font-style: italic;
          text-align: center;
          margin-bottom: 8px;
        }
        
        .qr-code {
          width: 90px;
          height: 90px;
          margin: 0 auto;
          display: block;
        }
        
        .disclaimer {
          font-size: 7pt;
          text-align: center;
          margin-top: 15px;
          font-style: italic;
          line-height: 1.2;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print Instructions */}
        <div className="fixed top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-3 print:hidden no-print max-w-sm">
          <p className="text-sm text-blue-800 font-medium mb-1">🎨 Color Printing Tip</p>
          <p className="text-xs text-blue-700">
            To print with colors, enable "Print backgrounds" or "More settings → Options → Background graphics" in your browser's print dialog.
          </p>
        </div>

        {/* Print Controls - Hidden when printing */}
        <div className="no-print print:hidden fixed top-4 right-4 z-10 space-x-2">
                  <button
                   onClick={() => navigate(`/print/retirement-cessation-dissolution/${documentId}`)}
                    
                    className="bg-smblue-400 text-white px-6 py-3 rounded-lg hover:bg-smblue-500 shadow-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <FiPrinter className="w-4 h-4" />
                    <span>Print Plain</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg my-5 hover:bg-purple-600 shadow-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <FiPrinter className="w-4 h-4" />
                    <span>Print Colored</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 shadow-lg transition-colors flex items-center space-x-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>

        {/* Certificate Content */}
        <div className="document-container">
          {/* Title */}
          <div className="title">
            RETIREMENT/CESSATION/DISSOLUTION
          </div>

          {/* Greeting */}
          <div className="greeting">
            To whom it may concern:
          </div>

          {/* Certification Text */}
          <div className="certification-text">
            This is to certify that the business establishment specified hereunder has filed for <strong>CLOSURE/RETIREMENT/CESSATION/DISSOLUTION</strong> of its business operation in Barangay West Triangle;
          </div>

          {/* Business Name Field */}
          <div className="form-section">
            <div className="field-label">Name of Business / Category / Activity</div>
            <div className="field-box">{businessName.toUpperCase()} / {businessCategory}</div>
          </div>

          {/* Office Address Field */}
          <div className="form-section">
            <div className="field-label">Office / Business Address</div>
            <div className="address-field">{businessAddress.toUpperCase()}</div>
          </div>

          {/* Owner Field */}
          <div className="form-section">
            <div className="field-label">Owner / Proprietor / Representative</div>
            <div className="owner-field">{businessOwner.toUpperCase()}</div>
          </div>

          {/* Info Row with small fields */}
          <div className="info-row">
            <div className="info-left">
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">Ownership</div>
                  <div className="small-box">{ownershipType}</div>
                </div>
              </div>
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">Date of Retirement/ Cessation</div>
                  <div className="small-box">{retirementDate}</div>
                </div>
              </div>
            </div>
            
            <div className="info-right">
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">Record No.</div>
                  <div className="small-box">{recordNumber}</div>
                </div>
              </div>
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">DA</div>
                  <div className="small-box date-field">{dateApproved}</div>
                </div>
              </div>
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">LC</div>
                  <div className="small-box">{lastCompliance}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose Text */}
          <div className="purpose-text">
            This certification is being issued upon the request of the above named company in connection with their application for business closure/ retirement/ cessation with the Business Permit and Licensing Office (BPLO) and for whatever lawful purpose it may serve.
          </div>

          {/* Issuance Information */}
          <div className="issuance-section">
            Issued this <span className="date-issued">{dateIssued}</span> at Quezon City, Metro Manila.
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div className="remarks-section">
              <div className="remarks-label">REMARKS</div>
              <div className="remarks-box">
                {document?.notes && (
                  <div style={{ fontSize: '8pt', lineHeight: '1.2' }}>
                    {document.notes}
                  </div>
                )}
              </div>
              <div className="fee-section">
                <div style={{ fontSize: '9pt', marginBottom: '3px' }}>Certification Fee:</div>
                <div className="fee-amount">₱ {processingFee.toLocaleString()}.00</div>
              </div>
            </div>
            
            <div className="official-section">
              <div className="official-name">{certifyingOfficial.toUpperCase()}</div>
              <div className="official-title">Punong Barangay</div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                alt="QR Code"
                className="qr-code"
              />
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

export default RetirementColoredPrint;