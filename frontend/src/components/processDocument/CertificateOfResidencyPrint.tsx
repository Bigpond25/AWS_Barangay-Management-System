// ============================================================================
// processDocument/CertificateOfResidencyPrint.tsx - Certificate of Residency Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

const CertificateHeader: React.FC = () => (
  <div className="text-center mb-8">
    <div className="mb-4">
      <h1 className="text-lg font-bold">REPUBLIC OF THE PHILIPPINES</h1>
      <h2 className="text-base font-bold">PROVINCE OF BATAAN</h2>
      <h2 className="text-base font-bold">MUNICIPALITY OF SAMAL</h2>
      <h1 className="text-lg font-bold">Brgy. Sikatuna Village</h1>
    </div>
    
    <div className="border-t-2 border-b-2 border-black py-2 my-5">
      <h2 className="text-lg font-bold">OFFICE OF THE PUNONG BARANGAY</h2>
    </div>
    
    <div className="text-xl font-bold underline mt-8">CERTIFICATE OF RESIDENCY</div>
  </div>
);

interface CertificateFooterProps {
  certifyingOfficial?: string; 
  dateIssued?: string;
  orNumber?: string;
  amountPaid?: number;
}

const CertificateFooter: React.FC<CertificateFooterProps> = ({ 
  certifyingOfficial, 
  dateIssued, 
  orNumber, 
  amountPaid 
}) => (
  <div className="mt-10 flex justify-between items-end">
    <div className="w-1/2">
      <div className="text-sm mb-4">Date Issued: {dateIssued || new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
      {orNumber && (
        <div className="text-sm mb-2">O.R. Number: {orNumber}</div>
      )}
      {amountPaid !== undefined && Number(amountPaid) > 0 && (
        <div className="text-sm">Amount Paid: ₱{Number(amountPaid).toFixed(2)}</div>
      )}
      {amountPaid !== undefined && Number(amountPaid) === 0 && (
        <div className="text-sm">Amount Paid: FREE</div>
      )}
    </div>
    
    <div className="w-1/2 text-center">
      <div className="inline-block w-64">
        <div className="border-b-2 border-black mb-1"></div>
        <div className="text-sm font-bold mt-10">
          {certifyingOfficial || 'ELENA CRUZ RODRIGUEZ'}
        </div>
        <div className="text-xs text-gray-600">Punong Barangay</div>
      </div>
    </div>
  </div>
);

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

const CertificateOfResidencyPrint: React.FC = () => {
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

  // Format applicant name
  const applicantName = document.applicant_name || 
    `${document.resident?.first_name || ''} ${document.resident?.middle_name || ''} ${document.resident?.last_name || ''}`.trim() ||
    'N/A';

  // Format address
  const applicantAddress = document.applicant_address || 
    document.resident?.complete_address || 
    'Brgy. Sikatuna Village, Samal, Bataan';

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

  // Format residency period if available
  const residencyPeriod = document.residency_period;

  return (
    <>
      <style>{`
        /* Print specifications for Letter size (8.5 x 11) */
        @media print {
          @page {
            size: letter; /* 8.5 x 11 inches */
            margin-top: 3.3cm;    /* Top margin - blank space */
            margin-left: 5.2cm;   /* Left margin - blank space */
            margin-right: 2.54cm; /* Right margin - 1 inch */
            margin-bottom: 2.54cm; /* Bottom margin - 1 inch */
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt !important;
            line-height: 1.4 !important;
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
          }
          
          .certificate-content {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
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
            /* Visual representation of margins */
            margin-left: calc(5.2cm + 20px);
            margin-top: calc(3.3cm + 20px);
            padding-right: 2.54cm;
            padding-bottom: 2.54cm;
            border-left: 3px dashed #ccc;
            border-top: 3px dashed #ccc;
          }
        }
        
        /* Document specific styles */
        .certificate-body {
          text-align: justify;
          line-height: 1.8;
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
        <div className="document-container certificate-content">
          <CertificateHeader />

          {/* Certificate Body */}
          <div className="mb-10 certificate-body">
            <p className="font-bold mb-5">TO WHOM IT MAY CONCERN:</p>
            
            <p className="mb-5">
              This is to certify that <span className="font-bold underline">{applicantName.toUpperCase()}</span>, 
              of legal age, Filipino citizen, 
              is a <span className="font-bold">BONAFIDE RESIDENT</span> of 
              <span className="font-bold"> {applicantAddress}</span>
              {residencyPeriod && <span> for <span className="font-bold">{residencyPeriod}</span></span>}.
            </p>

            <p className="mb-5">
              This certification is issued upon the request of the above-named person for 
              <span className="font-bold"> {document.purpose?.toLowerCase() || 'general purposes'}</span> and for whatever legal purpose 
              it may serve him/her best.
            </p>

            <p>
              Given this <span className="font-bold">{new Date().getDate()}{getOrdinalSuffix(new Date().getDate())}</span> day of{' '}
              <span className="font-bold">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>,{' '}
              <span className="font-bold">{new Date().getFullYear()}</span> at Brgy. Sikatuna Village, Samal, Bataan, Philippines.
            </p>
          </div>

          <CertificateFooter 
            certifyingOfficial={document.certifying_official || undefined}
            dateIssued={dateIssued}
            orNumber={orNumber}
            amountPaid={document.processing_fee}
          />
        </div>
      </div>
    </>
  );
};

export default CertificateOfResidencyPrint; 