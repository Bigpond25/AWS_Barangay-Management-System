// ============================================================================
// processDocument/BusinessPermitPrint.tsx - Modern Business Permit Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';



const BusinessPermitPrint: React.FC = () => {
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
  if (document.type !== 'BUSINESS_PERMIT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Business Permit. Expected: Business Permit, Got: {document.type.replace(/_/g, ' ')}
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

  // Business-specific information from document fields
  const businessName = document.business_name || document.applicant_name || 'Business Name Not Specified';
  const businessType = document.business_type || 'Business Type Not Specified';
  const businessAddress = document.business_address || applicantAddress;
  const businessOwner = document.business_owner || applicantName;

  return (
    <>
      <style>{`
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
          
          .business-details-box {
            border: 1px solid black !important;
            background: transparent !important;
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
        
        .business-details-box {
          border: 1px solid black;
          padding: 10px;
          margin: 15px 0;
          background: transparent;
        }
        
        .content-text {
          text-align: justify;
          margin-bottom: 10px;
          line-height: 1.3;
          font-size: 11pt;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 15px;
        }
        
        .signature-section {
          text-align: center;
          font-size: 10pt;
        }
        
        .signature-name {
          font-weight: bold;
          margin-bottom: 5px;
          text-decoration: underline;
        }
        
        .signature-title {
          font-style: italic;
          font-size: 10pt;
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

        {/* Document Content */}
        <div className="document-container">
          {/* Document Header */}
          <div className="document-header">
            <div className="mb-4">
              <h1 className="text-lg font-bold">REPUBLIC OF THE PHILIPPINES</h1>
              <h2 className="text-base font-semibold">QUEZON CITY</h2>
              <h3 className="text-base font-semibold">DISTRICT I</h3>
              <h4 className="text-lg font-bold">Barangay West Triangle</h4>
            </div>
            <div className="border-t-2 border-b-2 border-black py-2 mb-6">
              <h2 className="text-xl font-bold">OFFICE OF THE PUNONG BARANGAY</h2>
            </div>
            <div className="document-title">BARANGAY BUSINESS PERMIT</div>
          </div>

          {/* Document Content */}
          <div className="content-text">
            <strong>TO WHOM IT MAY CONCERN:</strong>
          </div>
          
          <div className="content-text">
            This is to certify that <strong><u>{applicantName.toUpperCase()}</u></strong>, 
            of legal age, Filipino citizen, and a resident of 
            <strong> {applicantAddress}</strong>, 
            has been granted permission to operate a business within the jurisdiction of this barangay.
          </div>

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

          <div className="content-text">
            This permit is issued subject to compliance with all applicable barangay ordinances, 
            municipal regulations, and national laws. The permittee is required to renew this permit annually 
            and to notify the barangay of any changes in business operations.
          </div>

          <div className="content-text">
            This certification is issued for <strong>{document.purpose?.toLowerCase() || 'business permit purposes'}</strong> and for whatever legal purpose it may serve the applicant.
          </div>

          <div className="content-text">
            Given this <strong>{new Date().getDate()}</strong> day of{' '}
            <strong>{new Date().toLocaleDateString('en-US', { month: 'long' })}</strong>,{' '}
            <strong>{new Date().getFullYear()}</strong> at Barangay West Triangle, Quezon City, Metro Manila.
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div style={{ width: '50%' }}>
              <p style={{ fontSize: '10pt', marginBottom: '4px' }}>Date Issued: {dateIssued}</p>
              {orNumber && (
                <p style={{ fontSize: '10pt', marginBottom: '2px' }}>O.R. Number: {orNumber}</p>
              )}
              {document.processing_fee !== undefined && Number(document.processing_fee) > 0 && (
                <p style={{ fontSize: '10pt' }}>Amount Paid: ₱{Number(document.processing_fee).toFixed(2)}</p>
              )}
              {document.processing_fee !== undefined && Number(document.processing_fee) === 0 && (
                <p style={{ fontSize: '10pt' }}>Amount Paid: FREE</p>
              )}
            </div>
            <div className="signature-section">
              <div style={{ marginTop: '20px' }}>
                <div className="signature-name">{document.certifying_official || 'PUNONG BARANGAY'}</div>
                <div className="signature-title">Punong Barangay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessPermitPrint; 