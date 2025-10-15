// ============================================================================
// processDocument/BarangayClearancePrint.tsx - Barangay Clearance (Liquor) Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

const BarangayClearancePrint: React.FC = () => {
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
  if (document.type !== 'BARANGAY_CLEARANCE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Barangay Clearance. Expected: Barangay Clearance, Got: {document.type.replace(/_/g, ' ')}
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
  const businessAddress = document.business_address || 'N/A';
  const certifyingOfficial = document.certifying_official || 'ELMER TIMOTHY J. LIGON';
  const referenceNumber = document.document_number ? document.document_number.split('-').pop() : '2882';
  const orNumber = document.serial_number || '7318991';
  const dateIssued = document.approved_date ? 
    new Date(document.approved_date).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'long', 
      year: 'numeric' 
    }) : 
    new Date().toLocaleDateString('en-US', { 
      day: '2-digit',
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
            font-size: 9pt !important;
            line-height: 1.1 !important;
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
        .document-header {
          text-align: center;
          margin-bottom: 15px;
          position: relative;
        }
        
        .document-title h1 {
          font-size: 16pt;
          font-weight: bold;
          text-decoration: underline;
          margin: 5px 0;
          letter-spacing: 2px;
        }
        
        .document-title h2 {
          font-size: 12pt;
          font-weight: bold;
          margin: 5px 0;
        }
        
        .reference-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 12px 0;
        }
        
        .reference-text {
          text-align: left;
          font-size: 11pt;
          line-height: 1.3;
          width: 60%;
        }
        
        .reference-number {
          background-color: #FF8C00;
          color: black;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 14pt;
          border: 2px solid black;
          background-color: #FF8C00 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .certificate-body {
          text-align: center;
          line-height: 1.4;
          margin: 15px 0;
        }
        
        .certification-intro {
          font-size: 10pt;
          margin-bottom: 10px;
        }
        
        .applicant-name {
          background-color: #D2B48C;
          border: 1px solid black;
          padding: 5px;
          font-weight: bold;
          font-size: 11pt;
          margin: 6px 0;
          display: inline-block;
          width: 80%;
          background-color: #D2B48C !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .business-text {
          font-size: 10pt;
          margin: 8px 0 5px 0;
        }
        
        .business-name {
          background-color: #D2B48C;
          border: 1px solid black;
          padding: 5px;
          font-weight: bold;
          font-size: 11pt;
          margin: 6px 0;
          display: inline-block;
          width: 80%;
          background-color: #D2B48C !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .location-text {
          font-size: 10pt;
          margin: 8px 0 5px 0;
        }
        
        .business-address {
          background-color: #D2B48C;
          border: 1px solid black;
          padding: 5px;
          font-weight: bold;
          font-size: 11pt;
          margin: 6px 0;
          display: inline-block;
          width: 80%;
          background-color: #D2B48C !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .ordinance-text {
          font-size: 10pt;
          margin: 12px 0;
          text-align: left;
        }
        
        .further-certification {
          font-size: 10pt;
          text-align: left;
          margin: 12px 0 8px 0;
        }
        
        .conditions-list {
          text-align: left;
          margin: 8px 0;
        }
        
        .condition-item {
          font-size: 9pt;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        
        .issuance-info {
          font-size: 10pt;
          text-align: left;
          margin: 15px 0;
        }
        
        .date-highlight {
          text-decoration: underline;
          font-weight: bold;
        }
        
        .signature-section {
          text-align: right;
          margin: 20px 0 15px 0;
        }
        
        .signature-block {
          display: inline-block;
        }
        
        .signature-name {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .signature-title {
          font-size: 10pt;
          font-style: italic;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          align-items: flex-end;
        }
        
        .left-column {
          width: 60%;
        }
        
        .footer-info {
          font-size: 9pt;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 5px;
          align-items: center;
        }
        
        .label {
          width: 80px;
          font-size: 9pt;
        }
        
        .value-line {
          border-bottom: 1px solid black;
          flex: 1;
          height: 14px;
          margin-left: 5px;
          margin-right: 10px;
        }
        
        .amount {
          color: red;
          font-weight: bold;
          margin-left: 5px;
        }
        
        .record-number {
          color: red;
          font-weight: bold;
          margin-left: 5px;
        }
        
        .right-column {
          width: 35%;
          text-align: right;
        }
        
        .or-info {
          margin-bottom: 15px;
        }
        
        .or-label {
          font-size: 9pt;
        }
        
        .or-number {
          font-size: 11pt;
          font-weight: bold;
          margin-left: 10px;
        }
        
        .barcode-section {
          margin-top: 10px;
        }
        
        .barcode-placeholder {
          width: 120px;
          height: 30px;
          border: 1px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          background-color: #f9f9f9;
          margin-left: auto;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print Controls */}
        <div className="fixed top-4 right-4 flex space-x-2 print:hidden no-print">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-4 py-2 rounded-lg hover:bg-smblue-500 transition-colors flex items-center space-x-2"
          >
            <FiPrinter className="w-5 h-5" />
            <span>Print Certificate</span>
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
            <div className="document-title">
              <h1>BARANGAY CLEARANCE</h1>
              <h2>(LIQUOR)</h2>
            </div>
            
            <div className="reference-section">
              <div className="reference-text">
                The Chairman / Executive Officer<br />
                Liquor Licensing Regulatory Board<br />
                Quezon City
              </div>
              <div className="reference-number">{referenceNumber}</div>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="certificate-body">
            <p className="certification-intro">
              This is to certify that this office interpose no objection to the application of
            </p>
            
            <div className="applicant-name">{businessOwner.toUpperCase()}</div>
            
            <p className="business-text">whose business establishment</p>
            
            <div className="business-name">{businessName.toUpperCase()}</div>
            
            <p className="location-text">located at</p>
            
            <div className="business-address">{businessAddress.toUpperCase()}</div>
            
            <p className="ordinance-text">
              up to the time allowed by Quezon City Ordinance No. NC-95, S-89;
            </p>
            
            <p className="further-certification">This certifies further that;</p>
            
            <div className="conditions-list">
              <div className="condition-item">
                1. This business establishment is more than 50 meters from the academic school. ( Sec. 15, Ord. 85)
              </div>
              <div className="condition-item">
                2. This business establishment is not erected at a public sidewalk, street, avenue, park or plaza on government property. ( Sec. 15, Ord. 85)
              </div>
              <div className="condition-item">
                3. This business establishment is not a nuisance to the public and safety and order.
              </div>
              <div className="condition-item">
                4. The applicant is of good moral character and a law abiding citizen.
              </div>
            </div>
            
            <div className="issuance-info">
              <span>Issued this</span>
              <span className="date-highlight"> {dateIssued} </span>
              <span>at Quezon City, Metro Manila.</span>
            </div>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-block">
              <div className="signature-name">{certifyingOfficial.toUpperCase()}</div>
              <div className="signature-title">Punong Barangay</div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div className="left-column">
              <div className="footer-info">
                <div className="info-row">
                  <span className="label">CTC no.</span>
                  <div className="value-line"></div>
                </div>
                <div className="info-row">
                  <span className="label">Issued on</span>
                  <div className="value-line"></div>
                </div>
                <div className="info-row">
                  <span className="label">Amt. Pd</span>
                  <div className="value-line"></div>
                </div>
                <div className="info-row">
                  <span className="label">Clearance Fee:</span>
                  <span className="amount">₱ 0.00</span>
                </div>
                <div className="info-row">
                  <span className="label">Record no.</span>
                  <span className="record-number">{referenceNumber}</span>
                </div>
              </div>
            </div>
            
            <div className="right-column">
              <div className="or-info">
                <span className="or-label">OR no.</span>
                <span className="or-number">{orNumber}</span>
              </div>
              <div className="barcode-section">
                <div className="barcode-placeholder">[BARCODE]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarangayClearancePrint;
