// ============================================================================
// processDocument/BarangayClearanceInstallationPrint.tsx - Barangay Clearance (Installation/Contracting) Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

const BarangayClearanceInstallationPrint: React.FC = () => {
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
  if (document.type !== 'BARANGAY_CLEARANCE_INSTALLATION') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Barangay Clearance (Installation/Contracting). 
            Expected: BARANGAY_CLEARANCE_INSTALLATION, Got: {document.type.replace(/_/g, ' ')}
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
  const businessName = document.business_name || 'MERALCO / UCCP';
  const businessOwner = document.business_owner || document.applicant_name || 'N/A';
  const projectSite = document.business_address || 'BAYANIHAN ST., BRGY. WEST TRIANGLE, QUEZON CITY';
  const purpose = document.clearance_purpose || 'INSTALLATION OF ONE (1) CONCRETE POLE';
  const certifyingOfficial = document.remarks?.includes('Certifying Official:') ? 
    document.remarks.match(/Certifying Official: ([^,]*)/)?.[1] || 'ELMER TIMOTHY J. LIGON' :
    'ELMER TIMOTHY J. LIGON';
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
          }
          
          * {
            visibility: visible !important;
            color: black !important;
            background: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          .field-highlight {
            background-color: #ffffcc !important;
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
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            padding-top: 3.3cm;
            padding-left: 5.2cm;
            padding-right: 2.54cm;
            padding-bottom: 2.54cm;
            position: relative;
          }
          
          /* Visual margin indicators */
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
              rgba(0,0,0,0.03) 10px,
              rgba(0,0,0,0.03) 20px
            );
            pointer-events: none;
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
              rgba(0,0,0,0.03) 10px,
              rgba(0,0,0,0.03) 20px
            );
            pointer-events: none;
          }
        }
        
        /* Document specific styles */
        .header-title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 20px;
          padding: 10px;
          border: 2px solid #000;
          background-color: #f0f0f0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .company-field {
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #000;
          background-color: #f9f9f9;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .clearance-text {
          text-align: center;
          margin: 15px 0;
          font-size: 11pt;
          line-height: 1.4;
        }
        
        .purpose-field {
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #000;
          background-color: #f9f9f9;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .location-field {
          text-align: center;
          font-size: 11pt;
          font-weight: bold;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #000;
          background-color: #f9f9f9;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .conditions-section {
          margin: 25px 0;
        }
        
        .conditions-header {
          font-size: 11pt;
          margin-bottom: 15px;
        }
        
        .condition-item {
          margin-bottom: 18px;
          text-align: justify;
          font-size: 10pt;
          line-height: 1.5;
        }
        
        .condition-number {
          font-weight: bold;
          margin-right: 8px;
          display: inline-block;
          width: 20px;
        }
        
        .footer-section {
          margin-top: 30px;
          margin-bottom: 25px;
        }
        
        .date-location {
          font-size: 10pt;
          text-align: left;
        }
        
        .date-highlight {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .signature-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 50px;
        }
        
        .signature-left {
          flex: 1;
          text-align: center;
          max-width: 60%;
        }
        
        .signature-right {
          text-align: center;
          margin-left: 40px;
        }
        
        .official-name {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 40px;
          text-transform: uppercase;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          width: 200px;
          margin: 0 auto 8px;
          height: 1px;
        }
        
        .official-title {
          font-size: 10pt;
          font-style: italic;
        }
        
        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .qr-placeholder {
          width: 100px;
          height: 100px;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .qr-placeholder img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print Controls */}
        <div className="fixed top-4 right-4 flex space-x-2 print:hidden no-print z-50">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-4 py-2 rounded-lg hover:bg-smblue-500 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FiPrinter className="w-5 h-5" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FiX className="w-5 h-5" />
            <span>Close</span>
          </button>
        </div>

        {/* Document Content */}
        <div className="document-container">
          
          <div className="header-title">
            BARANGAY CLEARANCE
          </div>

          <div className="company-field field-highlight">
            {businessName.toUpperCase()}
          </div>

          <div className="clearance-text">
            is hereby granted CLEARANCE for the
          </div>

          <div className="purpose-field field-highlight">
            {purpose.toUpperCase()}
          </div>

          <div className="clearance-text">
            at
          </div>

          <div className="location-field field-highlight">
            {projectSite.toUpperCase()}
          </div>

          <div className="conditions-section">
            <div className="conditions-header">
              subject to the following terms and conditions:
            </div>

            <div className="condition-item">
              <span className="condition-number">1.</span>
              The owner / contractor / sub-contractor shall comply with all the provisions provided in Barangay West Triangle Ordinance no. 02, S-2008.
            </div>

            <div className="condition-item">
              <span className="condition-number">2.</span>
              The project contractor/owner/sub-contractor shall comply with all the requirements and provisions under the Quezon City Zoning Ordinance, National Building Code, MMDA, Barangay and City Ordinances and other laws governing construction.
            </div>

            <div className="condition-item">
              <span className="condition-number">3.</span>
              That this clearance is TEMPORARY and may be revoked anytime should public safety and interest so demands and in case of violations of the terms and conditions stated in the above cited Laws, Ordinances and Regulations.
            </div>
          </div>

          <div className="footer-section">
            <div className="date-location">
              Signed and issued this <span className="date-highlight">{dateIssued}</span> at Quezon City, Metro Manila.
            </div>
          </div>

          <div className="signature-container">
            <div className="signature-left">
              <div className="official-name">HON. {certifyingOfficial}</div>
              <div className="signature-line"></div>
              <div className="official-title">Punong Barangay</div>
            </div>
            
            <div className="signature-right">
              <div className="qr-section">
                <div className="qr-placeholder">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    alt="QR Code"
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarangayClearanceInstallationPrint;
