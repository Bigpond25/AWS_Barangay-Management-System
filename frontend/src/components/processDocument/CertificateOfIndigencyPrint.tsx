// ============================================================================
// processDocument/CertificateOfIndigencyPrint.tsx - Certificate of Indigency Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

// Helper function to get ordinal suffix for dates
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Helper function to format date like "21 July 2025"
const formatDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface CertificateBottomSectionProps {
  certifyingOfficial?: string;
  orNumber?: string;
  remarks?: string[];
}

const CertificateBottomSection: React.FC<CertificateBottomSectionProps> = ({ 
  certifyingOfficial, 
  orNumber,
  remarks = []
}) => (
  <div className="bottom-section">
    <div className="left-column">
      <div className="remarks-section">
        <div className="remarks-title">REMARKS</div>
        <div className="remarks-content">
          {remarks.length > 0 ? (
            remarks.map((remark, index) => (
              <div key={index} className="remark-line">{remark}</div>
            ))
          ) : (
            <>
              <div className="remark-line">No previous records</div>
            </>
          )}
        </div>
      </div>
    </div>
    
    <div className="right-column">
      <div className="signature-section">
        <div className="signature-name">{certifyingOfficial || 'ELMER TIMOTHY J. LIGON'}</div>
        <div className="signature-title">Punong Barangay</div>
      </div>
      
      <div className="qr-code">
        <div className="qr-placeholder">[QR CODE]</div>
      </div>
    </div>
  </div>
);

const CertificateOfIndigencyPrint: React.FC = () => {
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
  if (document.type !== 'CERTIFICATE_OF_INDIGENCY') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Certificate of Indigency. Expected: Certificate of Indigency, Got: {document.type.replace(/_/g, ' ')}
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

  // Format applicant name
  const applicantName = document.applicant_name || 
    `${document.resident?.first_name || ''} ${document.resident?.middle_name || ''} ${document.resident?.last_name || ''}`.trim() ||
    'N/A';

  // Format address
  const applicantAddress = document.applicant_address || 
    document.resident?.complete_address || 
    'Brgy. West Triangle, Quezon City';

  // Generate OR number
  const orNumber = document.document_number || `OR-${(document.id || 0).toString().padStart(6, '0')}`;

  // Format date issued
  const dateIssued = document.approved_date ? 
    new Date(document.approved_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 
    new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  // Format indigency-specific information
  const indigencyReason = document.indigency_reason;
  const monthlyIncome = document.monthly_income;
  const familySize = document.family_size;

  return (
    <>
      <style>{`
        /* Print specifications for Letter size (8.5 x 11 inches) */
        @media print {
          @page {
            size: 8.5in 11in; /* Explicit Letter size dimensions */
            margin-top: 3.3cm;    /* Top margin - blank space for letterhead */
            margin-left: 5.2cm;   /* Left margin - blank space for binding */
            margin-right: 2.54cm; /* Right margin - 1 inch default */
            margin-bottom: 2.54cm; /* Bottom margin - 1 inch default */
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt !important;
            line-height: 1.3 !important;
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
            max-height: calc(27.94cm - 3.3cm - 2.54cm) !important;
          }
          
          * {
            visibility: visible !important;
            color: black !important;
            background: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
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
        .document-title {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 40px;
          letter-spacing: 2px;
        }
        
        .document-content {
          line-height: 1.8;
          margin-bottom: 30px;
        }
        
        .greeting {
          font-size: 12pt;
          margin-bottom: 25px;
        }
        
        .certification-text {
          font-size: 12pt;
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .main-statement {
          margin-top: 25px;
          margin-bottom: 25px;
        }
        
        .highlight-name {
          background-color: #333;
          color: white;
          padding: 2px 6px;
          font-weight: bold;
        }
        
        .highlight-address {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .highlight-requester {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .highlight-purpose {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .highlight-date {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .purpose-section {
          margin: 25px 0;
        }
        
        .purpose-text {
          font-size: 12pt;
          margin-bottom: 8px;
        }
        
        .issued-section {
          margin: 30px 0;
        }
        
        .issued-text {
          font-size: 12pt;
        }
        
        .bottom-section {
          display: flex;
          margin-top: 50px;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .left-column {
          width: 45%;
        }
        
        .right-column {
          width: 45%;
          text-align: right;
        }
        
        .remarks-section {
          border-left: 2px solid #000;
          padding-left: 15px;
        }
        
        .remarks-title {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .remarks-content {
          font-size: 10pt;
        }
        
        .remark-line {
          margin-bottom: 5px;
        }
        
        .signature-section {
          margin-bottom: 20px;
        }
        
        .signature-name {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .signature-title {
          font-size: 11pt;
          font-style: italic;
        }
        
        .qr-code {
          margin-top: 15px;
        }
        
        .qr-placeholder {
          width: 80px;
          height: 80px;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          margin-left: auto;
          background-color: #f9f9f9;
        }
        
        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          margin-top: 40px;
        }
        
        .barcode-section {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }
        
        .barcode-placeholder {
          width: 150px;
          height: 30px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          margin-right: 15px;
          background-color: #f9f9f9;
        }
        
        .record-info {
          text-align: left;
        }
        
        .record-label {
          font-size: 10pt;
          margin-bottom: 2px;
        }
        
        .record-number {
          font-size: 14pt;
          font-weight: bold;
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
          {/* Document Title */}
          <div className="document-title">
            CERTIFICATE OF INDIGENCY
          </div>

          {/* Document Content */}
          <div className="document-content">
            <div className="greeting">To whom it may concern:</div>
            
            <div className="certification-text">
              This is to certify that <span className="highlight-name">{applicantName.toUpperCase()}</span>
            </div>
            
            <div className="certification-text">
              presently residing at <span className="highlight-address">{applicantAddress}</span>
            </div>
            
            
            
            <div className="certification-text main-statement">
              It is further certified that the above-named person claims that their family has no 
              regular income to support their daily subsistence.
            </div>
            
            <div className="purpose-section">
              <div className="purpose-text">
                This certification is being issued upon the request of 
                <span className="highlight-requester"> {applicantName.toUpperCase()}</span>
              </div>
              <div className="purpose-text">
                for <span className="highlight-purpose">{document.purpose?.toUpperCase() || 'GENERAL PURPOSE'}.</span>
              </div>
            </div>
            
            <div className="issued-section">
              <div className="issued-text">
                Issued this <span className="highlight-date">{formatDate(new Date())}</span> 
                at Barangay West Triangle, Quezon City, Metro Manila.
              </div>
            </div>
          </div>

          {/* Bottom Section with Remarks and Signature */}
          <CertificateBottomSection
            certifyingOfficial={document.certifying_official || undefined}
            orNumber={orNumber}
            remarks={document.remarks ? [document.remarks] : []}
          />

          {/* Footer with barcode and record number */}
          <div className="footer">
            <div className="barcode-section">
              <div className="barcode-placeholder">[BARCODE]</div>
              <div className="record-info">
                <div className="record-label">Record No.</div>
                <div className="record-number">{document.serial_number?.replace(/\D/g, '') || '001'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificateOfIndigencyPrint; 