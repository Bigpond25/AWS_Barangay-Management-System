// ============================================================================
// previews/BusinessPermitPreview.tsx - Business Permit Preview with Sample Data
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiEye } from 'react-icons/fi';
import PrintStyles from '../_components/PrintStyles';

const CertificateHeader: React.FC = () => (
  <div className="text-center mb-8">
    <div className="mb-4">
      <h1 className="text-lg font-bold text-gray-800">REPUBLIC OF THE PHILIPPINES</h1>
      <h2 className="text-base font-semibold text-gray-700">PROVINCE OF BATAAN</h2>
      <h3 className="text-base font-semibold text-gray-700">MUNICIPALITY OF SAMAL</h3>
      <h4 className="text-lg font-bold text-gray-800">Brgy. Sikatuna Village</h4>
    </div>
    <div className="border-t-2 border-b-2 border-black py-2 mb-6">
      <h2 className="text-xl font-bold text-gray-800">OFFICE OF THE PUNONG BARANGAY</h2>
    </div>
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
  <div className="mt-12">
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <p className="text-sm mb-4">Date Issued: {dateIssued || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        {orNumber && (
          <p className="text-sm mb-2">O.R. Number: {orNumber}</p>
        )}
        {amountPaid !== undefined && Number(amountPaid) > 0 && (
          <p className="text-sm">Amount Paid: ₱{Number(amountPaid).toFixed(2)}</p>
        )}
        {amountPaid !== undefined && Number(amountPaid) === 0 && (
          <p className="text-sm">Amount Paid: FREE</p>
        )}
      </div>
      <div className="w-1/2 text-center">
        <div className="mt-8">
          <div className="border-b-2 border-black inline-block w-64 mb-2"></div>
          <p className="text-sm font-semibold">{certifyingOfficial || 'PUNONG BARANGAY'}</p>
          <p className="text-xs text-gray-600">Punong Barangay</p>
        </div>
      </div>
    </div>
  </div>
);

const BusinessPermitPreview: React.FC = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate('/process-document');
  };

  // Sample data for preview
  const sampleData = {
    applicantName: 'ROSARIO BUSINESS ENTERPRISES',
    applicantAddress: 'Corner Main St. & Rizal Ave., Brgy. Sikatuna Village, Samal, Bataan',
    purpose: 'business permit application',
    documentNumber: 'BP-2024-01-0001',
    processingFee: 150.00,
    certifyingOfficial: 'MAYOR RICARDO SANTOS',
    businessName: 'Rosario\'s Grocery and General Merchandise',
    businessType: 'Retail Store - General Merchandise',
    businessAddress: 'Lot 15, Block 3, Purok 2, Brgy. Sikatuna Village, Samal, Bataan',
    businessOwner: 'ROSARIO DELA CRUZ SANTOS',
    dateIssued: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };

  return (
    <>
      <PrintStyles />
      
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Preview Notice - Hidden when printing */}
        <div className="no-print print:hidden fixed top-4 left-4 z-10">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg max-w-sm">
            <div className="flex items-center">
              <FiEye className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Preview Mode</p>
                <p className="text-sm">This is a template preview with sample data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Controls - Hidden when printing */}
        <div className="no-print print:hidden fixed top-4 right-4 z-10 space-x-2">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-6 py-3 rounded-lg hover:bg-smblue-500 shadow-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print Preview</span>
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
        <div className="max-w-4xl mx-auto p-8 certificate-content print:p-0">
          <div className="bg-white p-8 shadow-lg print:shadow-none print:p-0 certificate-body">
            <CertificateHeader />
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 underline mb-6">BARANGAY BUSINESS PERMIT</h1>
            </div>

            <div className="mb-8">
              <p className="text-base leading-relaxed text-justify mb-4">
                <span className="font-semibold">TO WHOM IT MAY CONCERN:</span>
              </p>
              
              <p className="text-base leading-relaxed text-justify mb-6">
                This is to certify that <span className="font-semibold underline">{sampleData.businessOwner}</span>, 
                of legal age, Filipino citizen, and a resident of 
                <span className="font-semibold"> {sampleData.applicantAddress}</span>, 
                has been granted permission to operate a business within the jurisdiction of this barangay.
              </p>

              <div className="mb-6 p-4 border-2 border-gray-800 rounded business-details-box print:border-black">
                <h3 className="text-lg font-semibold mb-3 text-center">BUSINESS DETAILS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><span className="font-semibold">Business Name:</span> {sampleData.businessName}</p>
                    <p><span className="font-semibold">Business Type:</span> {sampleData.businessType}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Business Owner:</span> {sampleData.businessOwner}</p>
                    <p><span className="font-semibold">Business Address:</span> {sampleData.businessAddress}</p>
                  </div>
                </div>
              </div>

              <p className="text-base leading-relaxed text-justify mb-6">
                This permit is issued subject to compliance with all applicable barangay ordinances, 
                municipal regulations, and national laws. The permittee is required to renew this permit annually 
                and to notify the barangay of any changes in business operations.
              </p>

              <p className="text-base leading-relaxed text-justify mb-6">
                This certification is issued for <span className="font-semibold">{sampleData.purpose}</span> and for whatever legal purpose it may serve the applicant.
              </p>

              <p className="text-base leading-relaxed text-justify">
                Given this <span className="font-semibold">{new Date().getDate()}</span> day of{' '}
                <span className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>,{' '}
                <span className="font-semibold">{new Date().getFullYear()}</span> at Brgy. Sikatuna Village, Samal, Bataan, Philippines.
              </p>
            </div>

            <CertificateFooter 
              certifyingOfficial={sampleData.certifyingOfficial}
              dateIssued={sampleData.dateIssued}
              orNumber={sampleData.documentNumber}
              amountPaid={sampleData.processingFee}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessPermitPreview;
