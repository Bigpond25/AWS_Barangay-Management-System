// ============================================================================
// RetirementForm.tsx - Fixed version with proper field handling
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle, FiHome, FiCalendar } from 'react-icons/fi';

import { useResidents } from '../../services/residents/useResidents';
import { useBarangayOfficials } from '../../services/officials/useBarangayOfficials';
import { useDocumentForm } from './_hooks/useDocumentForm';
import { DocumentFormDataSchema, type DocumentFormData } from '../../services/documents/documents.types';
import { type Resident } from '../../services/residents/residents.types';
import { useNotifications } from '../_global/NotificationSystem';
import { getResidentAge } from '@/utils/ageUtils';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentFormField } from './_components/DocumentFormField';
import Breadcrumb from '../_global/Breadcrumb';

interface RetirementFormProps {
  onNavigate: (page: string) => void;
}

const RetirementForm: React.FC<RetirementFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCertifyingOfficial, setSelectedCertifyingOfficial] = useState('');
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      type: 'RETIREMENT_CESSATION_DISSOLUTION',
      resident_id: '',
      applicant_name: '',
      purpose: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 500,
      business_name: '',
      business_address: '',
      business_owner: '',
      // Add the missing fields to defaultValues
      ownership_type: '',
      retirement_date: '',
      business_type: '',
      requirements_submitted: ['Business Permit', 'Valid ID', 'Business Registration'],
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
    reset
  } = form;

  // Document form hook for API integration
  const documentForm = useDocumentForm({
    documentType: 'RETIREMENT_CESSATION_DISSOLUTION',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Retirement/Cessation/Dissolution certificate request has been submitted successfully'
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
  const purposeOptions = [
    'BPLO Application',
    'Business Closure',
    'Tax Clearance',
    'Legal Compliance',
    'Government Requirements',
    'Bank Requirements',
    'Other (Specify in Additional Info)'
  ];

  const ownershipTypeOptions = [
    'SOLE PROPRIETORSHIP',
    'PARTNERSHIP',
    'CORPORATION',
    'COOPERATIVE',
    'ASSOCIATION',
    'OTHER'
  ];

  const businessCategoryOptions = [
    'RETAIL',
    'WHOLESALE',
    'MANUFACTURING',
    'SERVICE',
    'RESTAURANT',
    'CONSTRUCTION',
    'TRANSPORTATION',
    'TECHNOLOGY',
    'HEALTHCARE',
    'EDUCATION',
    'OTHER'
  ];

  // Fetch active barangay officials for the certifying official dropdown
  const { data: officialsData, isLoading: isLoadingOfficials } = useBarangayOfficials({
    status: 'ACTIVE',
    current_term: true,
    per_page: 100
  });

  const officials = officialsData?.data || [];

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update form when resident is selected
  useEffect(() => {
    if (selectedResident) {
      const fullName = `${selectedResident.first_name} ${selectedResident.middle_name || ''} ${selectedResident.last_name}`.trim();

      setValue('resident_id', selectedResident.id);
      setValue('applicant_name', fullName);
      setValue('applicant_address', selectedResident.complete_address);
      setValue('applicant_contact', selectedResident.mobile_number || '');
      setValue('applicant_email', selectedResident.email_address || '');
      setValue('business_owner', fullName); // Default business owner to applicant
    }
  }, [selectedResident, setValue]);

  // Watch for priority changes to update processing fee
  const priority = watch('priority');
  useEffect(() => {
    setValue('processing_fee', priority === 'HIGH' ? 750 : 500);
  }, [priority, setValue]);

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setSearchTerm(`${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    setStep(2);
  };

  // Enhanced submit handler
const onSubmit = handleSubmit(async (formData) => {
  console.log('=== FORM SUBMISSION DEBUG START ===');
  console.log('1. Raw form data from React Hook Form:', formData);
  
  if (!selectedResident) {
    console.log('ERROR: No resident selected');
    showNotification({
      type: 'error',
      title: 'Validation Error',
      message: 'Please select a resident first'
    });
    return;
  }

  // Build the remarks field with certifying official info if selected
  let finalRemarks = formData.remarks || '';
  if (selectedCertifyingOfficial) {
    finalRemarks = `Certifying Official: ${selectedCertifyingOfficial}`;
    if (formData.remarks) {
      finalRemarks += ` | ${formData.remarks}`;
    }
  }
  console.log('2. Certifying Official:', selectedCertifyingOfficial);
  console.log('3. Final Remarks:', finalRemarks);

  // Create the final form data with all fields properly set
  const finalFormData: DocumentFormData = {
    ...formData,
    remarks: finalRemarks,
    business_type: formData.business_type || null,
    ownership_type: formData.ownership_type || null,
    retirement_date: formData.retirement_date || null,
  };

  console.log('4. Final form data being sent:', finalFormData);
  console.log('5. Critical fields check:');
  console.log('   - business_type:', finalFormData.business_type);
  console.log('   - ownership_type:', finalFormData.ownership_type);
  console.log('   - retirement_date:', finalFormData.retirement_date);
  console.log('   - business_name:', finalFormData.business_name);
  console.log('   - business_address:', finalFormData.business_address);
  console.log('=== FORM SUBMISSION DEBUG END ===');

  try {
    const result = await documentForm.handleSubmit(finalFormData);
    console.log('6. Submission successful, result:', result);
  } catch (error) {
    console.error('7. Form submission error:', error);
    console.error('   Failed with data:', finalFormData);
  }
});

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select Business Owner/Representative
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for business owner/representative *
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter owner's name..."
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
          />
        </div>

        {searchLoading && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" />
            <span>Searching...</span>
          </div>
        )}

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

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Can't find the business owner you're looking for?
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

        {!residents.length && searchTerm && !searchLoading && (
          <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm text-center">
              No residents found matching "{searchTerm}". Try a different search term or add a new resident.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div className="text-sm text-gray-900">{getResidentAge(selectedResident)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <div className="text-sm text-gray-900">{selectedResident.civil_status}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <div className="text-sm text-gray-900">{selectedResident.nationality}</div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
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

        {/* Business Information Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Business Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name Field */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="business_name"
                label="Business/Company Name"
                type="text"
                placeholder="Enter the full business name"
                required
              />
            </div>

            {/* Business Address Field */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="business_address"
                label="Business Address"
                type="text"
                placeholder="Complete business address"
                required
              />
            </div>

            {/* Business Owner Field */}
            <DocumentFormField
              name="business_owner"
              label="Business Owner/Proprietor/Representative"
              type="text"
              placeholder="Owner or authorized representative name"
              required
            />

            {/* Ownership Type Field - Fixed to use DocumentFormField */}
            <DocumentFormField
              name="ownership_type"
              label="Ownership Type"
              type="select"
              options={ownershipTypeOptions.map(type => ({ value: type, label: type }))}
              placeholder="Select ownership type"
              required
            />

            {/* Business Category Field - Fixed to properly save to business_category field */}
            <DocumentFormField
              name="business_type"
              label="Business Category"
              type="select"
              options={businessCategoryOptions.map(category => ({ value: category, label: category }))}
              placeholder="Select business category"
              required
            />

            {/* Retirement/Cessation Date Field - Fixed to use DocumentFormField */}
            <DocumentFormField
              name="retirement_date"
              label="Date of Retirement/Cessation"
              type="date"
              required
            />
          </div>
        </div>

        {/* Certificate Details Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Certificate Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purpose Field */}
            <DocumentFormField
              name="purpose"
              label="Purpose"
              type="select"
              options={purposeOptions.map(p => ({ value: p, label: p }))}
              placeholder="Select purpose"
              required
            />

            {/* Certifying Official - Store in state, will be added to remarks on submit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifying Official <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCertifyingOfficial}
                onChange={(e) => setSelectedCertifyingOfficial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                disabled={isLoadingOfficials}
                required
              >
                <option value="">
                  {isLoadingOfficials ? 'Loading officials...' : 'Select official'}
                </option>
                {officials.map((official) => {
                  const fullName = `${official.prefix} ${official.first_name} ${official.middle_name ? official.middle_name + ' ' : ''}${official.last_name}${official.suffix ? ' ' + official.suffix : ''}`.trim();
                  const positionText = official.position.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={official.id} value={fullName}>
                      {fullName} ({positionText})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Additional Information Field */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="notes"
                label="Additional Information"
                type="textarea"
                placeholder="Any additional information or special circumstances..."
                rows={3}
              />
            </div>
          </div>

          {/* Urgent Request Option */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={watch('priority') === 'HIGH'}
                onChange={(e) => {
                  setValue('priority', e.target.checked ? 'HIGH' : 'NORMAL');
                }}
                className="h-4 w-4 text-smblue-400 focus:ring-smblue-200 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Urgent Processing Request (+₱250 fee)
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-600">
              Urgent requests are processed within 1-2 business days instead of the standard 3-5 business days.
            </p>
          </div>

          {/* Processing Fee Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Processing Fee:</span>
              <span className="text-lg font-bold text-smblue-400">
                ₱{watch('processing_fee')}
              </span>
            </div>
            {watch('priority') === 'HIGH' && (
              <p className="text-xs text-gray-600 mt-1">
                Includes ₱500 standard fee + ₱250 urgent processing fee
              </p>
            )}
          </div>

          {/* Certificate Information Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiHome className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Certificate Information
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>This certificate confirms the <strong>closure/retirement/cessation/dissolution</strong> of business operations in Barangay West Triangle.</p>
                  <p className="mt-1">Required for BPLO applications and business closure compliance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiCalendar className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Required Documents
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Valid ID of the business owner/representative</li>
                    <li>Business permit or business registration documents</li>
                    <li>Mayor's permit (if available)</li>
                    <li>Certificate of business closure (if available)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form-level Error Display */}
          {errors.root && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{errors.root.message}</p>
              </div>
            </div>
          )}

          {/* Document Form Error Display */}
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
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
        </div>
      </form>
    </FormProvider>
  );

  const renderStep3 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-darktext mb-2">Request Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your Retirement/Cessation/Dissolution certificate request has been submitted and is now being processed.
        You will be notified once it's ready for pickup.
      </p>

      {selectedResident && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Business Owner:</strong> {selectedResident.first_name} {selectedResident.last_name}</p>
            <p><strong>Business Name:</strong> {watch('business_name')}</p>
            <p><strong>Document:</strong> Retirement/Cessation/Dissolution Certificate</p>
            <p><strong>Purpose:</strong> {watch('purpose')}</p>
            <p><strong>Processing Fee:</strong> ₱{watch('processing_fee')}</p>
            <p><strong>Expected Processing Time:</strong> {watch('priority') === 'HIGH' ? '1-2 business days' : '3-5 business days'}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <FiHome className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3 text-left">
            <h3 className="text-sm font-medium text-blue-800">
              Important Reminders
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Certificate confirms business closure/retirement/cessation</li>
                <li>Present valid ID when claiming your certificate</li>
                <li>Bring required business documents for verification</li>
                <li>Processing may require additional verification</li>
                <li>Valid for BPLO and other government requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onNavigate('process-document')}
          className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
        >
          Back to Documents
        </button>
        <button
          onClick={() => {
            setStep(1);
            setSelectedResident(null);
            setSearchTerm('');
            setSelectedCertifyingOfficial('');
            reset({
              type: 'RETIREMENT_CESSATION_DISSOLUTION',
              resident_id: '',
              applicant_name: '',
              purpose: '',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 500,
              business_name: '',
              business_address: '',
              business_owner: '',
              ownership_type: '',
              retirement_date: '',
              business_type: '',
              requirements_submitted: ['Business Permit', 'Valid ID', 'Business Registration'],
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

      {/* Header */}
      <div className={`mb-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <h1 className="text-2xl font-bold text-darktext">Retirement/Cessation/Dissolution Certificate Request</h1>
        <p className="text-gray-600 mt-1">Request a certificate for business closure/retirement/cessation</p>
      </div>

      {/* Step Indicator */}
      <div className={`mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '100ms' }}>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === stepNumber
                ? 'bg-smblue-400 text-white'
                : step > stepNumber
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }`}>
                {step > stepNumber ? <FiCheck /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-16 mt-2">
          <span className={`text-xs ${step === 1 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Select Owner
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Business Details
          </span>
          <span className={`text-xs ${step === 3 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Confirmation
          </span>
        </div>
      </div>

      {/* Form Steps */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default RetirementForm;