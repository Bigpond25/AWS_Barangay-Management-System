// ============================================================================
// BusinessSignClearanceForm.tsx - Business Sign Clearance Request Form
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

import { useResidents } from '../../services/residents/useResidents';
import { useDocumentForm } from './_hooks/useDocumentForm';
import { DocumentFormDataSchema, type DocumentFormData } from '../../services/documents/documents.types';
import { type Resident } from '../../services/residents/residents.types';
import { useNotifications } from '../_global/NotificationSystem';
import { getResidentAge } from '@/utils/ageUtils';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentFormField } from './_components/DocumentFormField';
import Breadcrumb from '../_global/Breadcrumb';

interface BusinessSignClearanceFormProps {
  onNavigate: (page: string) => void;
}

const BusinessSignClearanceForm: React.FC<BusinessSignClearanceFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      type: 'BUSINESS_SIGN_CLEARANCE',
      resident_id: '',
      applicant_name: '',
      purpose: 'BUSINESS_SIGNAGE',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 500, // Default fee for sign clearance
      business_name: '',
      business_owner: '',
      business_address: '',
      sign_wordings: '',
      sign_material: '',
      sign_size: '',
      requirements_submitted: ['Business Permit', 'Sign Layout/Design'],
      notes: '',
      remarks: '',
    },
    mode: 'onChange',
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset
  } = form;

  // Document form hook for API integration
  const documentForm = useDocumentForm({
    documentType: 'BUSINESS_SIGN_CLEARANCE',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Business Sign Clearance request has been submitted successfully'
      });
      setStep(3);
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message
      });
    }
  });

  // Residents query for search  
  const {
    data: residentsData,
    isLoading: searchLoading
  } = useResidents({
    search: searchTerm,
    per_page: 10
  });

  const residents = residentsData?.data || [];

  // Static data for form options
  const materialOptions = [
    'Tarpaulin Print',
    'LED/Neon',
    'Acrylic',
    'Metal/Aluminum',
    'Wood',
    'Vinyl Sticker',
    'Glass',
    'Other'
  ];

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle resident selection
  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    
    // Set form values from resident data
    setValue('resident_id', resident.id);
    setValue('applicant_name', `${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    setValue('applicant_address', resident.complete_address || '');
    setValue('applicant_contact', resident.mobile_number || '');
    setValue('applicant_email', resident.email_address || '');
    
    // Auto-fill business owner with resident name
    setValue('business_owner', `${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    
    setStep(2);
  };

  // Handle form submission
  const onSubmit = handleSubmit(async (data) => {
    // Calculate fee based on sign size
    const calculateFee = () => {
      const size = data.sign_size || '';
      const match = size.match(/(\d+)\s*[xX]\s*(\d+)/);
      if (match) {
        const area = parseInt(match[1]) * parseInt(match[2]);
        // Example: ₱100 per square meter
        return Math.max(500, area * 100);
      }
      return 500; // Default minimum fee
    };

    data.processing_fee = calculateFee();
    
    await documentForm.handleSubmit(data);
  });

  // Step 1: Select Resident
  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select Business Owner/Representative
      </h2>

      {/* Search Bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, ID, or contact number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200 transition-colors"
        />
      </div>

      {/* Loading State */}
      {searchLoading && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
          <LoadingSpinner size="sm" />
          <span>Searching...</span>
        </div>
      )}

      {/* Search Results */}
      {residents.length > 0 && searchTerm && (
        <div className="mt-2 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {residents.map((resident) => (
            <div
              key={resident.id}
              onClick={() => handleResidentSelect(resident)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-smblue-100 rounded-full flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-smblue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {resident.first_name} {resident.middle_name} {resident.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{resident.complete_address}</div>
                  <div className="text-xs text-gray-400">
                    Age: {getResidentAge(resident)} • {resident.civil_status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Resident Option */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Can't find the business owner/representative?
          </p>
          <button
            onClick={() => onNavigate('residents/add')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiUser className="w-4 h-4 mr-2" />
            Add New Resident
          </button>
        </div>
      </div>

      {/* No Results Message */}
      {!residents.length && searchTerm && !searchLoading && (
        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm text-center">
            No residents found matching "{searchTerm}". Try a different search term or add a new resident.
          </p>
        </div>
      )}
    </div>
  );

  // Step 2: Fill Form Details
  const renderStep2 = () => (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>

        {/* Resident Information Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Business Owner/Representative Information
          </h2>

          {selectedResident && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="text-sm text-gray-900">
                  {selectedResident.first_name} {selectedResident.middle_name} {selectedResident.last_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <div className="text-sm text-gray-900">{selectedResident.mobile_number || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-sm text-gray-900">{selectedResident.email_address || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div className="text-sm text-gray-900">{getResidentAge(selectedResident)} years old</div>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="text-sm text-gray-900">{selectedResident.complete_address}</div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center text-sm text-smblue-400 hover:text-smblue-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Change Business Owner
            </button>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Business Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentFormField
              name="business_name"
              label="Business/Company Name"
              type="text"
              placeholder="Enter business name"
              required
            />

            <DocumentFormField
              name="business_owner"
              label="Business Owner/Representative"
              type="text"
              placeholder="Enter owner/representative name"
              required
            />

            <div className="md:col-span-2">
              <DocumentFormField
                name="business_address"
                label="Business Address"
                type="text"
                placeholder="Enter complete business address"
                required
              />
            </div>
          </div>
        </div>

        {/* Sign Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Sign Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <DocumentFormField
                name="sign_wordings"
                label="Sign Wordings/Text"
                type="textarea"
                placeholder="Enter the exact text/wordings that will appear on the sign"
                rows={3}
                required
              />
            </div>

            <DocumentFormField
              name="sign_material"
              label="Sign Material"
              type="select"
              options={materialOptions.map(m => ({ value: m, label: m }))}
              placeholder="Select sign material"
              required
            />

            <DocumentFormField
              name="sign_size"
              label="Sign Size (L x H)"
              type="text"
              placeholder="e.g., 19 MTRS x 4 MTRS"
              required
            />

            <div className="md:col-span-2">
              <DocumentFormField
                name="notes"
                label="Additional Information"
                type="textarea"
                placeholder="Any additional details about the sign installation..."
                rows={3}
              />
            </div>
          </div>

          {/* Fee Calculation Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The clearance fee will be calculated based on the sign size. 
              Minimum fee is ₱500.00. Additional charges may apply for larger signs.
            </p>
          </div>
        </div>



        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={documentForm.isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={documentForm.isSubmitting || !isValid}
            className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {documentForm.isSubmitting && (
              <LoadingSpinner size="sm" />
            )}
            <span>{documentForm.isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>

        {/* Error Display */}
        {documentForm.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{documentForm.error}</p>
              </div>
              <button
                type="button"
                onClick={documentForm.clearError}
                className="text-red-600 underline text-sm hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );

  // Step 3: Success
  const renderStep3 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheck className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-semibold text-darktext mb-2">Request Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your Business Sign Clearance request has been submitted and is being processed.
      </p>
      
      {selectedResident && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Request Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Business Owner:</span> {selectedResident.first_name} {selectedResident.last_name}</p>
            <p><span className="font-medium">Business Name:</span> {watch('business_name')}</p>
            <p><span className="font-medium">Sign Material:</span> {watch('sign_material')}</p>
            <p><span className="font-medium">Sign Size:</span> {watch('sign_size')}</p>
            <p><span className="font-medium">Processing Fee:</span> ₱{watch('processing_fee')}</p>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onNavigate('process-document')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Documents
        </button>
        <button
          onClick={() => {
            setStep(1);
            setSelectedResident(null);
            setSearchTerm('');
            reset({
              type: 'BUSINESS_SIGN_CLEARANCE',
              resident_id: '',
              applicant_name: '',
              purpose: 'BUSINESS_SIGNAGE',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 500,
              business_name: '',
              business_owner: '',
              business_address: '',
              sign_wordings: '',
              sign_material: '',
              sign_size: '',
              requirements_submitted: ['Business Permit', 'Sign Layout/Design'],
              notes: '',
              remarks: '',
            });
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb isLoaded={isLoaded} />

      <div className="space-y-6">
        {/* Header */}
        <div className={`mb-6 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <h1 className="text-2xl font-bold text-darktext">Business Sign Clearance Request</h1>
        <p className="text-gray-600 mt-1">Request clearance for business signage installation</p>
      </div>

      {/* Step Indicator */}
      <div className={`mb-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '100ms' }}>
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-smblue-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-smblue-400 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="font-medium">Select Owner</span>
          </div>
          
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-smblue-400' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-smblue-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-smblue-400 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="font-medium">Fill Details</span>
          </div>
          
          <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-smblue-400' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-smblue-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-smblue-400 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="font-medium">Complete</span>
          </div>
        </div>
      </div>

        {/* Render Current Step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BusinessSignClearanceForm;
