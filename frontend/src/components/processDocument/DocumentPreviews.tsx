// ============================================================================
// processDocument/DocumentPreviews.tsx - Document Template Previews Page
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiFileText, FiPrinter, FiArrowLeft } from 'react-icons/fi';

interface PreviewCardProps {
  title: string;
  description: string;
  previewPath: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ 
  title, 
  description, 
  previewPath, 
  icon: Icon, 
  color 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className={`${color} p-4`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-6 h-6 text-white" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(previewPath)}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <FiEye className="w-4 h-4" />
            <span>Preview Template</span>
          </button>
          
          <button
            onClick={() => {
              navigate(previewPath);
              // Small delay to allow navigation, then trigger print
              setTimeout(() => window.print(), 100);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentPreviews: React.FC = () => {
  const navigate = useNavigate();

  const documentTemplates = [
    {
      title: 'Barangay Clearance',
      description: 'Certificate of good moral character and community standing for residents.',
      previewPath: '/preview/barangay-clearance',
      icon: FiFileText,
      color: 'bg-green-500'
    },
    {
      title: 'Certificate of Residency',
      description: 'Certification of bonafide residency within the barangay jurisdiction.',
      previewPath: '/preview/certificate-residency',
      icon: FiFileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Certificate of Indigency',
      description: 'Certification for low-income families qualifying for assistance programs.',
      previewPath: '/preview/certificate-indigency',
      icon: FiFileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Business Permit',
      description: 'Barangay-level business operation permit for local enterprises.',
      previewPath: '/preview/business-permit',
      icon: FiFileText,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/process-document')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Documents</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Document Template Previews</h1>
          <p className="text-gray-600 mt-2">
            Preview document templates with sample data to see how they look when printed.
          </p>
        </div>

        {/* Print Layout Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiPrinter className="w-5 h-5 text-blue-400 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Print Specifications</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Paper Size:</strong> Letter (8.5 x 11 inches)</li>
                  <li><strong>Top Margin:</strong> 3.3cm (for letterhead/logo)</li>
                  <li><strong>Left Margin:</strong> 5.2cm (for binding/filing)</li>
                  <li><strong>Right/Bottom Margins:</strong> 2.54cm (1 inch)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documentTemplates.map((template, index) => (
            <PreviewCard
              key={index}
              title={template.title}
              description={template.description}
              previewPath={template.previewPath}
              icon={template.icon}
              color={template.color}
            />
          ))}
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use Previews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Screen Preview</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click "Preview Template" to view the document</li>
                <li>• Red/blue overlays show margin boundaries</li>
                <li>• Content appears within the printable area</li>
                <li>• Sample data demonstrates final appearance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Print Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click "Print" for direct print preview</li>
                <li>• Use browser's print preview (Ctrl+P)</li>
                <li>• Verify margins match specifications</li>
                <li>• Test on actual Letter size paper</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiEye className="w-5 h-5 text-yellow-400 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Direct Access URLs</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">You can also access previews directly via these URLs:</p>
                <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                  <li>/preview/barangay-clearance</li>
                  <li>/preview/certificate-residency</li>
                  <li>/preview/certificate-indigency</li>
                  <li>/preview/business-permit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviews;
