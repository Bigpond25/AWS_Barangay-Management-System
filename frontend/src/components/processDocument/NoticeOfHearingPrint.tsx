// ============================================================================
// processDocument/NoticeOfHearingPrint.tsx - Notice of Hearing Print Component
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import { useResident } from '@/services/residents/useResidents';
import type { Document } from '@/services/documents/documents.types';

const NoticeOfHearingPrint: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  // Fetch document and resident data separately
  const { 
    data: document, 
    isLoading: isLoadingDocument, 
    error: documentError 
  } = useDocument(documentId || '', !!documentId);

  // Fetch complainant data using resident_id from document
  const { 
    data: complainant, 
    isLoading: isLoadingComplainant, 
    error: complainantError 
  } = useResident(document?.resident_id || '', !!document?.resident_id);

  const isLoading = isLoadingDocument || isLoadingComplainant;
  const error = documentError || complainantError;

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
  if (document.type !== 'NOTICE_OF_HEARING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Notice of Hearing. Expected: Notice of Hearing, Got: {document.type.replace(/_/g, ' ')}
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

  // Extract data for the notice
  console.log('Document data:', document);
  console.log('Complainant data:', complainant);

  // Case information
  const caseNumber = document.case_number || 'XX-XX';
  const caseTitle = document.case_title || 'General Case';
  const hearingType = document.hearing_type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Mediation';
  
  // Party information
  const complainantName = document.complainant_name || document.applicant_name || 'N/A';
  const complainantAddress = document.complainant_address || document.applicant_address || 'Brgy. West Triangle, Quezon City';
  
  const respondentName = document.respondent_name || 'N/A';
  const respondentAddress = document.respondent_address || 'Brgy. West Triangle, Quezon City';

  // Hearing details
  const hearingDate = document.hearing_date ? 
    new Date(document.hearing_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 
    '_________________';

  const hearingTime = document.hearing_time || '_________________';

  // Presiding official from remarks
  const presidingOfficial = document.remarks || 'RODRIGO CAMPO';

  // Issue date
  const issueDate = document.created_at ? 
    new Date(document.created_at).toLocaleDateString('en-US', { 
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
            margin-left: calc(5.2cm + 20px);
            margin-top: calc(3.3cm + 20px);
            padding-right: 2.54cm;
            padding-bottom: 2.54cm;
            border-left: 3px dashed #ccc;
            border-top: 3px dashed #ccc;
            min-height: calc(27.94cm - 3.3cm - 2.54cm);
          }
        }
        
        /* Document styles */
        .document-header {
          text-align: center;
          margin-bottom: 12px;
          position: relative;
        }
        
        .logo-left {
          position: absolute;
          left: 0;
          top: 0;
          width: 80px;
          height: 80px;
          background-color: #4CAF50;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          color: white;
          font-weight: bold;
        }
        
        .logo-right {
          position: absolute;
          right: 0;
          top: 0;
          width: 80px;
          height: 80px;
          background-color: #2196F3;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8pt;
          color: white;
          font-weight: bold;
        }
        
        .header-text {
          margin: 0 100px;
          padding-top: 10px;
        }
        
        .republic-text {
          font-size: 12pt;
          font-weight: bold;
          margin: 3px 0;
        }
        
        .barangay-text {
          font-size: 11pt;
          font-weight: bold;
          margin: 2px 0;
        }
        
        .office-text {
          font-size: 10pt;
          font-weight: bold;
          margin: 8px 0 5px 0;
        }
        
        .divider-line {
          border-bottom: 2px solid black;
          margin: 8px 0;
        }
        
        .case-info-section {
          margin: 12px 0;
        }
        
        .complainant-section {
          background-color: #333;
          color: white;
          padding: 5px 8px;
          margin-bottom: 3px;
          font-weight: bold;
          font-size: 11pt;
          display: inline-block;
        }
        
        .complainant-label {
          font-size: 9pt;
          font-style: italic;
          margin-bottom: 8px;
        }
        
        .case-details {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
        }
        
        .left-section {
          width: 60%;
        }
        
        .right-section {
          width: 35%;
          text-align: left;
        }
        
        .against-text {
          font-size: 11pt;
          font-weight: bold;
          margin: 8px 0;
        }
        
        .respondent-name {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .respondent-label {
          font-size: 9pt;
          font-style: italic;
          margin-bottom: 12px;
        }
        
        .case-number {
          font-size: 10pt;
          margin-bottom: 5px;
        }
        
        .case-for {
          font-size: 10pt;
          margin-bottom: 5px;
        }
        
        .address-section {
          margin: 12px 0;
        }
        
        .to-label {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .to-name {
          font-size: 10pt;
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 2px;
        }
        
        .to-address {
          font-size: 10pt;
          margin-bottom: 2px;
        }
        
        .notice-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0 8px 0;
        }
        
        .notice-subtitle {
          text-align: center;
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .notice-content {
          text-align: justify;
          line-height: 1.3;
          margin: 15px 0;
          font-size: 9pt;
        }
        
        .issuance-section {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          align-items: center;
        }
        
        .issued-text {
          font-size: 10pt;
        }
        
        .location-text {
          font-size: 10pt;
        }
        
        .signature-section {
          text-align: right;
          margin: 20px 0 15px 0;
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
        
        .notification-section {
          margin: 15px 0;
        }
        
        .notification-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .notification-label {
          font-size: 9pt;
        }
        
        .notification-line {
          border-bottom: 1px solid black;
          width: 80px;
          margin: 0 8px;
        }
        
        .signature-lines-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        
        .signature-block {
          width: 45%;
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid black;
          height: 1px;
          margin: 15px 0 3px 0;
        }
        
        .signature-label {
          font-size: 9pt;
          font-style: italic;
        }

        .hearing-date-highlight {
          font-weight: bold;
          text-decoration: underline;
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
            <span>Print Notice</span>
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
          
          {/* Document Header */}
          <div className="document-header">
            <div className="logo-left">BARANGAY<br />LOGO</div>
            <div className="logo-right">QUEZON<br />CITY<br />LOGO</div>
            
            <div className="header-text">
              <div className="republic-text">REPUBLIC OF THE PHILIPPINES</div>
              <div className="barangay-text">Barangay West Triangle</div>
              <div className="barangay-text">District I, Quezon City</div>
              <div className="office-text">OFFICE OF THE PUNONG BARANGAY</div>
            </div>
          </div>

          <div className="divider-line"></div>

          {/* Case Information */}
          <div className="case-info-section">
            <div className="complainant-section">{complainantName}</div>
            <div className="complainant-label">Complainant</div>
            
            <div className="case-details">
              <div className="left-section">
                <div className="against-text">AGAINST</div>
                
                <div className="respondent-name">{respondentName}</div>
                <div className="respondent-label">Respondent</div>
              </div>
              
              <div className="right-section">
                <div className="case-number">Barangay Case # <strong>{caseNumber}</strong></div>
                <div className="case-for">For: <strong>{caseTitle}</strong></div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="address-section">
            <div className="to-label">To:</div>
            <div className="to-name">{respondentName}</div>
            {respondentAddress.split(',').map((line, index) => (
              <div key={index} className="to-address">{line.trim()}</div>
            ))}
          </div>

          {/* Notice Title */}
          <div className="notice-title">NOTICE OF HEARING</div>
          {hearingType === 'Failure To Appear' && (
            <div className="notice-subtitle">RE: FAILURE TO APPEAR</div>
          )}

          {/* Notice Content */}
          <div className="notice-content">
            {hearingType === 'Failure To Appear' ? (
              <>
                You are hereby required to appear before me / the pangkat on{' '}
                <span className="hearing-date-highlight">{hearingDate}</span> to explain why you failed to appear for mediation / conciliation and hearing scheduled on{' '}
                <span className="hearing-date-highlight">_________________</span> and why your counterclaim (if any) arising from this complaint should not be dismissed, a 
                certificate to bar the filing of said counterclaim in court/government office should not be 
                issued, and criminal proceedings should not be initiated in court for willful failure or 
                refusal to appear before the Punong Barangay/Pangkat.
              </>
            ) : (
              <>
                You are hereby notified to appear before the undersigned on{' '}
                <span className="hearing-date-highlight">{hearingDate} at {hearingTime}</span> for the {hearingType.toLowerCase()} of the above-entitled case.
                {document.case_description && (
                  <>
                    <br /><br />
                    <strong>Case Description:</strong> {document.case_description}
                  </>
                )}
                {document.notes && (
                  <>
                    <br /><br />
                    <strong>Additional Instructions:</strong> {document.notes}
                  </>
                )}
                <br /><br />
                Failure to appear on the scheduled date and time may result in the dismissal of your case or a decision being rendered against you based on the available evidence.
              </>
            )}
          </div>

          {/* Issuance Section */}
          <div className="issuance-section">
            <div className="issued-text">Issued this {issueDate}</div>
            <div className="location-text">at Quezon City, Metro Manila.</div>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-name">{presidingOfficial.toUpperCase()}</div>
            <div className="signature-title">
              {presidingOfficial.includes('Lupon') ? 'Lupon President' : 'Punong Barangay'}
            </div>
          </div>

          {/* Notification Section */}
          <div className="notification-section">
            <div className="notification-row">
              <span className="notification-label">Notified this</span>
              <div className="notification-line"></div>
              <span className="notification-label">day of</span>
              <div className="notification-line"></div>
              <span className="notification-label">20</span>
              <div className="notification-line"></div>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="signature-lines-section">
            <div className="signature-block">
              <div className="signature-line"></div>
              <div className="signature-label">Complainant/s</div>
            </div>
            
            <div className="signature-block">
              <div className="signature-line"></div>
              <div className="signature-label">Respondent/s</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoticeOfHearingPrint;