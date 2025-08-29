// ============================================================================
// processDocument/CashBondPrint.tsx - Cash Bond Acknowledgement Receipt Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

// Utility function to convert number to words (Philippine Peso)
const numberToWords = (num: number): string => {
  if (num === 0) return 'ZERO PESOS';
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    
    return ones[Math.floor(n / 100)] + ' HUNDRED' + 
           (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const convertMillions = (n: number): string => {
    if (n >= 1000000) {
      return convertLessThanThousand(Math.floor(n / 1000000)) + ' MILLION' +
             (n % 1000000 !== 0 ? ' ' + convertThousands(n % 1000000) : '');
    }
    return convertThousands(n);
  };
  
  const convertThousands = (n: number): string => {
    if (n >= 1000) {
      return convertLessThanThousand(Math.floor(n / 1000)) + ' THOUSAND' +
             (n % 1000 !== 0 ? ' ' + convertLessThanThousand(n % 1000) : '');
    }
    return convertLessThanThousand(n);
  };
  
  // Split into whole and decimal parts
  const [whole, decimal] = num.toFixed(2).split('.');
  const wholeNum = parseInt(whole);
  const decimalNum = parseInt(decimal);
  
  let result = convertMillions(wholeNum) + ' PESOS';
  
  if (decimalNum > 0) {
    result += ' AND ' + decimalNum + '/100 CENTAVOS';
  }
  
  return result;
};

const CashBondPrint: React.FC = () => {
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
  if (document.type !== 'CASH_BOND') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Cash Bond Acknowledgement Receipt. 
            Expected: CASH_BOND, Got: {document.type.replace(/_/g, ' ')}
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
  const receivedFrom = document.received_from || 'MERALCO / UCCP';
  const bondAmount = document.bond_amount ? Number(document.bond_amount) : 10000;
  const amountInWords = numberToWords(bondAmount);
  const representingEntity = document.representing_entity || 'INSTALLATION OF ONE (1) CONCRETE POLE';
  const projectLocation = document.acknowledgement_address || 'BAYANIHAN ST., BRGY. WEST TRIANGLE, QUEZON CITY';
  
  // Officials
  const receivedBy = document.remarks?.includes('Certifying Official:') ? 
    document.remarks.match(/Certifying Official: ([^,]*)/)?.[1] || 'RIVA C. ANCHETA' :
    'RIVA C. ANCHETA';
  const notedBy = document.approved_by_user?.name || 'ELMER TIMOTHY J. LIGON';
  
  // Date
  const dateIssued = document.submitted_at ? 
    new Date(document.submitted_at).toLocaleDateString('en-US', { 
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
        .header-section {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .logo-container {
          width: 80px;
          height: 80px;
          margin-right: 20px;
        }
        
        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .header-text {
          flex: 1;
          text-align: center;
        }
        
        .republic-text {
          font-size: 9pt;
          margin-bottom: 2px;
        }
        
        .barangay-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .district-text {
          font-size: 11pt;
          margin-bottom: 15px;
        }
        
        .document-title {
          font-size: 13pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 20px;
        }
        
        .date-box {
          position: absolute;
          top: 20px;
          right: 0;
          border: 2px solid black;
          padding: 5px 10px;
          background-color: #ffffcc;
          font-weight: bold;
          font-size: 10pt;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .form-section {
          margin-bottom: 10px;
        }
        
        .form-label {
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 5px;
        }
        
        .form-field {
          border: 1px solid black;
          padding: 8px;
          background-color: #ffffcc;
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 10px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .amount-section {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .amount-label {
          font-size: 10pt;
          font-style: italic;
          margin-right: 10px;
          white-space: nowrap;
        }
        
        .amount-container {
          flex: 1;
        }
        
        .amount-figure {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .amount-figure-label {
          font-size: 9pt;
          font-style: italic;
          margin-right: 10px;
        }
        
        .amount-figure-box {
          border: 1px solid black;
          padding: 5px 10px;
          background-color: #ffffcc;
          font-weight: bold;
          font-size: 11pt;
          min-width: 120px;
          text-align: right;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          margin-bottom: 20px;
        }
        
        .signature-block {
          width: 45%;
        }
        
        .signature-label {
          font-size: 10pt;
          margin-bottom: 30px;
        }
        
        .signature-line {
          border-bottom: 1px solid black;
          margin-bottom: 5px;
        }
        
        .signature-name {
          font-size: 10pt;
          font-weight: bold;
        }
        
        .signature-title {
          font-size: 9pt;
          font-style: italic;
        }
        
        .conditions-section {
          font-size: 9pt;
          line-height: 1.4;
          margin-top: 20px;
          text-align: justify;
        }
        
        .conditions-header {
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .condition-item {
          margin-bottom: 8px;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 20px;
        }
        
        .conforme-text {
          font-size: 10pt;
          font-style: italic;
        }
        
        .qr-container {
          width: 100px;
          height: 100px;
          border: 2px solid black;
          padding: 2px;
        }
        
        .qr-container img {
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
            <span>Print Receipt</span>
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
          {/* Header Section */}
          <div className="header-section">
            <div className="logo-container">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2IxZkju6BycokIeGAZrKRrGm5tj-VNnzr9w&s"
                alt="Barangay Logo"
              />
            </div>
            <div className="header-text">
              <div className="republic-text">Republic of the Philippines</div>
              <div className="barangay-name">BARANGAY WEST TRIANGLE</div>
              <div className="district-text">District 1, Quezon City</div>
              <div className="document-title">CASH BOND ACKNOWLEDGEMENT RECEIPT</div>
            </div>
            <div className="date-box">{dateIssued}</div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="form-label">Received From</div>
            <div className="form-field field-highlight">{receivedFrom.toUpperCase()}</div>
          </div>

          <div className="amount-section">
            <div className="amount-label">the amount of (words)</div>
            <div className="amount-container">
              <div className="amount-figure">
                <span className="amount-figure-label">Bond Amount (figure)</span>
                <div className="amount-figure-box field-highlight">
                  {bondAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="form-field field-highlight">{amountInWords}</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-label">representing cash bond deposit for the</div>
            <div className="form-field field-highlight">{representingEntity.toUpperCase()}</div>
          </div>

          <div className="form-section">
            <div className="form-label">at</div>
            <div className="form-field field-highlight">{projectLocation.toUpperCase()}</div>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-block">
              <div className="signature-label">Received by:</div>
              <div className="signature-line"></div>
              <div className="signature-name">{receivedBy.toUpperCase()}</div>
              <div className="signature-title">Barangay Treasurer</div>
            </div>
            <div className="signature-block">
              <div className="signature-label">Noted by:</div>
              <div className="signature-line"></div>
              <div className="signature-name">{notedBy.toUpperCase()}</div>
              <div className="signature-title">Punong Barangay</div>
            </div>
          </div>

          {/* Refund Conditions */}
          <div className="conditions-section">
            <div className="conditions-header">Refund conditions: (As per IRR of Ord. 02. S-2008)</div>
            
            <div className="condition-item">
              a) The owner/contractor/subcontractor shall request for the refund of bond deposit after the completion of the project and payment of indemnity, if any.
            </div>
            <div className="condition-item">
              b) The owner/contractor/subcontractor should submit the as-built drawing together with the certificate of project completion to the Barangay
            </div>
            <div className="condition-item">
              c) The owner/contractor/subcontractor should submit a certificate of no damage or certificate of no claim from surrounding neighbors and/or commercial establishments.
            </div>
            <div className="condition-item">
              d) Corresponding Permit from the QC Building Official, QC Planning Office and other concerned government agencies shall be submitted to the Barangay Secretary prior to release of the Cash Bond Deposit.
            </div>
            <div className="condition-item">
              e) Upon completion and submission of the required certificates, the Barangay Secretary shall subject such documents for verification and authentication. If legitimacy is established, the Barangay Treasurer upon recommendation of the barangay secretary shall release the bond deposit after 3 working days, less the accumulated amount of deductions, if any.
            </div>
            <div className="condition-item">
              f) Original Acknowledgement Receipt shall be surrendered prior to release of the cash bond.
            </div>
            <div className="condition-item">
              g) Cash bond on road works shall be refunded six (6) months after the completion of the project for the Barangay to determine the sturdiness of the filled/used materials and likewise to ensure that the completed work or project have not cracked, swelled or sunken.
            </div>
          </div>

          {/* Footer with QR Code */}
          <div className="footer-section">
            <div className="conforme-text">CONFORME:</div>
            <div className="qr-container">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                alt="QR Code"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CashBondPrint;