// ============================================================================
// processDocument/CertificateOfResidencyPrint.tsx - Integrated Certificate Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';
import { buildImageUrl, getPlaceholderImageUrl } from '@/utils/imageUtils';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import { useResident } from '@/services/residents/useResidents';
import type { Document } from '@/services/documents/documents.types';
import { getResidentAge } from '@/utils/ageUtils';

const CertificateOfResidencyPrint: React.FC = () => {
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
  if (document.type !== 'CERTIFICATE_OF_RESIDENCY') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Certificate of Residency. Expected: Certificate of Residency, Got: {document.type.replace(/_/g, ' ')}
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

  // Extract data for the certificate - using the same pattern as CertificateOfResidencyForm
  // Debug log to see what data we have
  console.log('Document data:', document);
  console.log('Resident data:', resident);
  console.log('Document resident_id:', document?.resident_id);
  
  // Use document fields for basic info (populated from form)
  const applicantName = document?.applicant_name || 'N/A';

  // Parse name parts for the detailed form
  const nameParts = applicantName.split(' ').filter(part => part.length > 0);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts.length === 2 ? '' : nameParts[1] || '');

  // Address from document fields (filled from form)
  const applicantAddress = document?.applicant_address || 'Brgy. West Triangle, Quezon City';

  // Personal data from resident - same as CertificateOfResidencyForm
  const age = resident ? getResidentAge(resident) : 'N/A';
  const sex = resident?.gender?.toUpperCase() || 'N/A';
  const civilStatus = resident?.civil_status?.toUpperCase() || 'N/A';
  const nationality = resident?.nationality?.toUpperCase() || 'FILIPINO';
  const birthPlace = resident?.birth_place?.toUpperCase() || 'QUEZON CITY';
  const occupation = resident?.occupation?.toUpperCase() || 'N/A';

  // Birth date with proper error handling
  let birthDate = 'N/A';
  if (resident?.birth_date) {
    try {
      const date = new Date(resident.birth_date);
      if (!isNaN(date.getTime())) {
        birthDate = date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'long', 
          year: 'numeric' 
        });
      } else {
        birthDate = resident.birth_date.toString();
      }
    } catch (e) {
      console.warn('Error parsing birth date:', e);
      birthDate = resident.birth_date?.toString() || 'N/A';
    }
  }

  // Document specific data
  const purpose = document.purpose?.toUpperCase() || 'GENERAL PURPOSES';
  const certifyingOfficial = document.certifying_official || 'ELENA CRUZ RODRIGUEZ';
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
  const orNumber = document.document_number || `OR-${(document.id || 0).toString().padStart(6, '0')}`;
  const getRecordNumber = (document: any): string => {
  // First try to extract numbers from serial_number
  if (document.serial_number) {
    const numericPart = document.serial_number.replace(/\D/g, '');
    if (numericPart) {
      return numericPart.padStart(4, '0');
    }
  }
  
  // Fallback to document ID
  return (document.id || 1).toString().padStart(4, '0');
};

const recordNumber = getRecordNumber(document);

  // Contact information and document data
  const contactNumber = document?.applicant_contact || resident?.mobile_number || '';
  const email = document?.applicant_email || resident?.email_address || '';

  // Photo URL - from resident data
  const photoUrl = resident?.profile_photo_url ? buildImageUrl(resident.profile_photo_url) : '';

  // Extract residency period info from document
  const residencyPeriod = document?.residency_period || 'PERMANENT';

  return (
    <>
      <style>{`
        /* Print specifications for Letter size (8.5 x 11) */
        @media print {
          @page {
            size: letter;
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
        
        .document-title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }
        
        .greeting {
          margin-bottom: 15px;
          font-size: 10pt;
        }
        
        .certification-content {
          margin-bottom: 20px;
          line-height: 1.4;
          font-size: 10pt;
        }
        
        /* Bio details table */
        .bio-section {
          display: table;
          width: 100%;
          margin: 15px 0;
        }
        
        .left-bio {
          display: table-cell;
          width: 60%;
          vertical-align: top;
          padding-right: 20px;
        }
        
        .right-bio {
          display: table-cell;
          width: 40%;
          vertical-align: top;
        }
        
        .info-row {
          margin-bottom: 3px;
          font-size: 10pt;
          display: flex;
        }
        
        .info-label {
          width: 110px;
          font-weight: normal;
        }
        
        .info-colon {
          width: 15px;
        }
        
        .info-value {
          font-weight: bold;
          flex: 1;
        }
        
        /* Photo/Contact/Signature section */
        .photo-contact-section {
          display: table;
          width: 100%;
          margin: 20px 0;
        }
        
        .spacer-left {
          display: table-cell;
          width: 60%;
        }
        
        .photo-contact-right {
          display: table-cell;
          width: 40%;
          vertical-align: top;
        }
        
        .three-column-layout {
          display: table;
          width: 100%;
        }
        
        .photo-column {
          display: table-cell;
          width: 33%;
          vertical-align: top;
          text-align: center;
        }
        
        .contact-signature-column {
          display: table-cell;
          width: 34%;
          vertical-align: top;
          padding: 0 10px;
        }
        
        .thumbmark-column {
          display: table-cell;
          width: 33%;
          vertical-align: top;
          text-align: center;
        }
        
        .photo-area {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .photo-placeholder {
          width: 150px;
          height: 150px;
          border: 1px solid #000;
          display: inline-block;
          background-color: #f9f9f9;
          line-height: 120px;
          font-size: 8pt;
          margin-bottom: 5px;
          object-fit: cover;
        }
        
        .photo-image {
          width: 150px;
          height: 150px;
          border: 1px solid #000;
          display: inline-block;
          margin-bottom: 5px;
          object-fit: cover;
        }
        
        .photo-label {
          font-size: 8pt;
          font-weight: bold;
        }
        
        .contact-fields {
          margin-bottom: 15px;
        }
        
        .contact-row {
          display: flex;
          margin-bottom: 5px;
          align-items: center;
          font-size: 9pt;
        }
        
        .contact-label {
          width: 50px;
        }
        
        .contact-field {
          border-bottom: 1px solid #000;
          flex: 1;
          height: 15px;
          font-size: 8pt;
          padding-left: 2px;
        }
        
        .signature-area {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          width: 150px;
          height: 15px;
          margin: 0 auto 5px;
          margin-top: 40px;
        }
        
        .signature-label {
          font-size: 9pt;
          font-weight: bold;
          margin-bottom: 10px;
          margin-top: 10px;
        }
        
        .thumbmark-box {
          border: 1px solid #000;
          height: 150px;
          width: 150px;
          margin: 0 auto 5px;
          background-color: #f9f9f9;
        }
        
        .thumbmark-label {
          font-size: 9pt;
          font-weight: bold;
        }
        
        .issuance-info {
          margin: 20px 0 15px 0;
          text-align: center;
          font-size: 10pt;
        }
        
        .date-issued {
          font-weight: bold;
        }
        
        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 15px;
        }
        
        .record-info {
          font-size: 9pt;
        }
        
        .record-row {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .record-label {
          width: 80px;
        }
        
        .record-line {
          border-bottom: 1px solid #000;
          width: 120px;
          height: 15px;
        }
        
        .record-number {
          border: 1px solid #000;
          padding: 3px 8px;
          font-weight: bold;
          background-color: #f0f0f0;
        }
        
        .official-signature {
          text-align: center;
        }
        
        .official-name {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .official-title {
          font-size: 9pt;
          font-style: italic;
          margin-bottom: 8px;
        }
        
        .qr-code {
          width: 60px;
          height: 60px;
          margin: 0 auto;
          display: block;
        }
        
        .disclaimer {
          font-size: 7pt;
          text-align: center;
          margin-top: 10px;
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
          <div className="document-title">
            C e r t i f i c a t i o n
          </div>

          <div className="greeting">
            To whom it may concern:
          </div>

          <div className="certification-content">
            This is to certify that the person whose information, picture and signature or thumbmark appears below is presently residing at <strong>BARANGAY WEST TRIANGLE</strong>, Quezon City.
          </div>

          {/* Bio details section */}
          <div className="bio-section">
            <div className="left-bio">
              <div className="info-row">
                <div className="info-label">SURNAME</div>
                <div className="info-colon">:</div>
                <div className="info-value">{lastName.toUpperCase()}</div>
              </div>
              <div className="info-row">
                <div className="info-label">FIRST NAME</div>
                <div className="info-colon">:</div>
                <div className="info-value">{firstName.toUpperCase()}</div>
              </div>
              <div className="info-row">
                <div className="info-label">MIDDLE NAME</div>
                <div className="info-colon">:</div>
                <div className="info-value">{middleName.toUpperCase()}</div>
              </div>
              <div className="info-row">
                <div className="info-label">ADDRESS</div>
                <div className="info-colon">:</div>
                <div className="info-value">{applicantAddress.toUpperCase()}</div>
              </div>
              <div className="info-row">
                <div className="info-label">SEX</div>
                <div className="info-colon">:</div>
                <div className="info-value">{sex}</div>
              </div>
              <div className="info-row">
                <div className="info-label">BIRTHDATE</div>
                <div className="info-colon">:</div>
                <div className="info-value">{birthDate}</div>
              </div>
              <div className="info-row">
                <div className="info-label">OCCUPATION</div>
                <div className="info-colon">:</div>
                <div className="info-value">{occupation}</div>
              </div>
              <div className="info-row">
                <div className="info-label">PURPOSE</div>
                <div className="info-colon">:</div>
                <div className="info-value">{purpose}</div>
              </div>
              <div className="info-row">
                <div className="info-label">REMARKS</div>
                <div className="info-colon">:</div>
                <div className="info-value"><em>NO DEROGATORY RECORD ON FILE</em></div>
              </div>
            </div>
            
            <div className="right-bio">
              <div className="info-row">
                <div className="info-label">STATUS</div>
                <div className="info-colon">:</div>
                <div className="info-value">{civilStatus}</div>
              </div>
              <div className="info-row">
                <div className="info-label">NATIONALITY</div>
                <div className="info-colon">:</div>
                <div className="info-value">{nationality}</div>
              </div>
              <div className="info-row">
                <div className="info-label">BPLACE</div>
                <div className="info-colon">:</div>
                <div className="info-value">{birthPlace}</div>
              </div>
              <div className="info-row">
                <div className="info-label">RESIDENCY STATUS</div>
                <div className="info-colon">:</div>
                <div className="info-value">BONAFIDE RES.</div>
              </div>
            </div>
          </div>

          {/* Photo, Contact, and Signature section */}
          <div className="photo-contact-section">
            <div className="photo-contact-right">
              <div className="three-column-layout">
                <div className="photo-column">
  {photoUrl ? (
    <img 
      src={photoUrl} 
      alt="Resident Photo" 
      className="photo-image"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = getPlaceholderImageUrl(150, 'No Photo');
        target.onerror = null; // Prevent infinite loop
      }}
    />
  ) : (
    <div className="photo-placeholder">
      {/* You could also use a placeholder image here */}
      <img 
        src={getPlaceholderImageUrl(150, 'No Photo')} 
        alt="No Photo" 
        className="photo-image"
      />
    </div>
  )}
  <div className="photo-label">PHOTO</div>
</div>
                
                <div className="contact-signature-column">
                  <div className="contact-fields">
                    <div className="contact-row">
                      <div className="contact-label">Contact:</div>
                      <div className="contact-field">{contactNumber}</div>
                    </div>
                    <div className="contact-row">
                      <div className="contact-label">email:</div>
                      <div className="contact-field">{email}</div>
                    </div>
                    <div className="contact-row">
                      <div className="contact-label">Age:</div>
                      <div className="contact-field">{age}</div>
                    </div>
                    <div className="contact-row">
                      <div className="contact-label">LOS:</div>
                      <div className="contact-field">{residencyPeriod}</div>
                    </div>
                  </div>

                  <div className="signature-area">
                    <div className="signature-line"></div>
                    <div className="signature-label">SIGNATURE</div>
                  </div>
                </div>
                
                <div className="thumbmark-column">
                  <div className="thumbmark-box"></div>
                  <div className="thumbmark-label">Right<br />Thumbmark</div>
                </div>
              </div>
            </div>
          </div>

          <div className="issuance-info">
            Signed and issued this <span className="date-issued">{dateIssued}</span> at Barangay West Triangle<br />
            Quezon City, Metro Manila.
          </div>

          <div className="footer-section">
            <div className="record-info">
              <div className="record-row">
                <div className="record-label">CTC No.</div>
                <div className="record-line"></div>
              </div>
              <div className="record-row">
                <div className="record-label">Issued on</div>
                <div className="record-line"></div>
              </div>
              <div className="record-row">
                <div className="record-label">Issued at</div>
                <div className="record-line"></div>
              </div>
              <div className="record-row">
                <div className="record-label">Record No.</div>
                <div className="record-number">{recordNumber}</div>
              </div>
            </div>
            
            <div className="official-signature">
            <div className="official-name">{certifyingOfficial.toUpperCase()}</div>
            <div className="official-title">Punong Barangay</div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
              alt="QR Code"
              className="qr-code"
            />
          </div>
          </div>

          <div className="disclaimer">
            NOTE: 1.) Null and void if found with erasures or alterations and if without<br />
            barangay seal.<br />
            2.) Valid for six (6) months from date of issue.
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificateOfResidencyPrint;