// ============================================================================
// processDocument/RetirementPrint.tsx - Integrated Retirement/Cessation/Dissolution Certificate Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import { useResident } from '@/services/residents/useResidents';
import type { Document } from '@/services/documents/documents.types';

const RetirementPrint: React.FC = () => {
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
  
  // Extract business category from remarks if available
  const remarks = document?.remarks || '';
  const categoryMatch = remarks.match(/Business Category: ([^,]*)/);
  const businessCategory = categoryMatch ? categoryMatch[1].trim() : 'N/A';
  
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

  // Generate document numbers
  const recordNumber = document.id?.toString().padStart(4, '0') || '0000';
  const processingFee = document?.processing_fee || 500;

  // Additional document fields - placeholders for now
  const documentAgent = 'TBD'; // Placeholder
  const licenseCode = 'TBD'; // Placeholder

  return (
    <>
      <style>{`
        /* Print specifications for Short Bond (8.5 x 11 inches) */
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
            color: black !important;
            background: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
        
        /* Screen styles */
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
            padding: 20px;
            min-height: 600px;
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
          background-color: #ffe0e0;
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
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .official-title {
          font-size: 9pt;
          font-style: italic;
          margin-bottom: 8px;
        }
        
        .qr-placeholder {
          width: 80px;
          height: 80px;
          border: 1px solid #000;
          margin: 0 auto;
          background-color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6pt;
          color: white;
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
        {/* Print Controls - Hidden when printing */}
        <div className="no-print print:hidden fixed top-4 right-4 z-10 space-x-2">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-6 py-3 rounded-lg hover:bg-smblue-500 shadow-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print Certificate</span>
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
                  <div className="small-box record-field">{recordNumber}</div>
                </div>
              </div>
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">DA</div>
                  <div className="small-box date-field">{documentAgent}</div>
                </div>
              </div>
              <div className="small-field-group">
                <div className="small-field">
                  <div className="small-label">LC</div>
                  <div className="small-box">{licenseCode}</div>
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
              <div className="qr-placeholder">QR CODE</div>
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

export default RetirementPrint;