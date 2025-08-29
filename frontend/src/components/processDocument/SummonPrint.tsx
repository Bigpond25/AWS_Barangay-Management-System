// ============================================================================
// processDocument/SummonPrint.tsx - Barangay Summon Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

const SummonPrint: React.FC = () => {
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
  if (document.type !== 'SUMMON') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Summon. 
            Expected: SUMMON, Got: {document.type.replace(/_/g, ' ')}
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
  const barangayCase = document.barangay_case || '25-17';
  const complainant = document.for || 'Unknown';
  const respondent = document.to || 'Unknown';
  const respondentAddress = document.summon_address || 'Unknown';
  
  // Parse summon date and time
  const summonDate = document.summon_date ? 
    new Date(document.summon_date).toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric' 
    }) : 'Unknown';
  
  const summonTime = document.summon_time || '10:00 am';
  
  // Date issued
  const dateIssued = document.submitted_at ? 
    new Date(document.submitted_at).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric' 
    }).replace(/\s/g, '-') : 
    new Date().toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric' 
    }).replace(/\s/g, '-');

  // Certifying official
  const certifyingOfficial = document.remarks?.includes('Certifying Official:') ? 
    document.remarks.match(/Certifying Official: ([^,]*)/)?.[1] || 'ELMER TIMOTHY J. LIGON' :
    'ELMER TIMOTHY J. LIGON';

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
            font-size: 12pt !important;
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
        .logo-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .logo-box {
          width: 80px;
          height: 80px;
          border: 2px solid black;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
        }
        
        .logo-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .logo-label {
          font-size: 8pt;
          text-align: center;
          margin-top: 2px;
          color: #666;
        }
        
        .header-text {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .republic-text {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .barangay-name {
          font-size: 14pt;
          margin-bottom: 2px;
        }
        
        .district-text {
          font-size: 12pt;
          margin-bottom: 12px;
        }
        
        .office-text {
          font-size: 13pt;
          font-weight: bold;
        }
        
        .case-info-section {
          margin: 30px 0;
        }
        
        .case-box {
          border: 1px solid black;
          padding: 10px;
          margin-bottom: 15px;
        }
        
        .case-label {
          display: inline;
        }
        
        .case-number {
          color: red;
          font-weight: bold;
        }
        
        .for-box {
          border: 1px solid black;
          padding: 10px;
          min-height: 60px;
        }
        
        .for-label {
          margin-bottom: 0px;
        }
        
        .recipient-section {
          margin: 30px 0;
        }
        
        .to-label {
          margin-bottom: 15px;
        }
        
        .recipient-name {
          font-size: 14pt;
          color: #888;
          margin-bottom: 10px;
        }
        
        .recipient-address {
          margin-bottom: 5px;
        }
        
        .summon-title {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          text-decoration: underline;
          margin: 40px 0 30px 0;
        }
        
        .summon-body {
          text-align: center;
          margin: 30px 0;
          line-height: 1.8;
        }
        
        .summon-datetime {
          margin: 20px 0;
        }
        
        .datetime-highlight {
          color: red;
          font-weight: bold;
          text-decoration: underline;
          font-size: 14pt;
          margin: 0 10px;
        }
        
        .complaint-text {
          margin-top: 30px;
        }
        
        .footer-section {
          margin-top: 50px;
        }
        
        .issue-date {
          margin-bottom: 50px;
        }
        
        .signature-section {
          text-align: right;
          margin-top: 60px;
        }
        
        .signature-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .signature-title {
          font-size: 12pt;
          font-style: italic;
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
            <span>Print Summon</span>
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
          {/* Logo Section */}
          <div className="logo-section">
            <div>
              <div className="logo-box">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2IxZkju6BycokIeGAZrKRrGm5tj-VNnzr9w&s"
                  alt="Barangay Logo"
                />
              </div>
            </div>
            <div>
              <div className="logo-box">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Quezon_City_Council_seal.jpg"
                  alt="Quezon City Logo"
                />
              </div>
            </div>
          </div>

          {/* Header Text */}
          <div className="header-text">
            <div className="republic-text">REPUBLIC OF THE</div>
            <div className="republic-text">PHILIPPINES</div>
            <div className="barangay-name">Barangay West Triangle</div>
            <div className="district-text">District I, Quezon City</div>
            <div className="office-text">OFFICE OF THE PUNONG BARANGAY</div>
          </div>

          {/* Case Information */}
          <div className="case-info-section">
            <div className="case-box">
              <span className="case-label">Barangay Case: </span>
              <span className="case-number">{barangayCase}</span>
            </div>
            <div className="for-box">
              <div className="for-label">For: {complainant.toUpperCase()}</div>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="recipient-section">
            <div className="to-label">To:</div>
            <div className="recipient-name">{respondent.toUpperCase()}</div>
            <div className="recipient-address">{respondentAddress.toUpperCase()}</div>
          </div>

          {/* Summon Title */}
          <div className="summon-title">SUMMON</div>

          {/* Summon Body */}
          <div className="summon-body">
            <p>You are hereby required to appear before me on</p>
            
            <div className="summon-datetime">
              <span className="datetime-highlight">{summonDate}</span>
              <span className="datetime-highlight">{summonTime}</span>
            </div>
            
            <p className="complaint-text">for the hearing of your complaint.</p>
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div className="issue-date">
              Issued this <strong>{dateIssued}</strong> at Quezon City, Metro Manila.
            </div>

            {/* Signature Section */}
            <div className="signature-section">
              <div className="signature-name">{certifyingOfficial.toUpperCase()}</div>
              <div className="signature-title">Punong Barangay</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummonPrint;