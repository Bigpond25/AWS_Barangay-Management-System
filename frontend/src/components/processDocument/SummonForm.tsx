// ============================================================================
// SummonForm.tsx - Barangay Summon Form
// ============================================================================

import { useDebounce } from '@/hooks/useDebounce';
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

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

interface SummonFormProps {
  onNavigate: (page: string) => void;
}

const SummonForm: React.FC<SummonFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotifications();

  // Form initialization with react-hook-form and zod
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      type: 'SUMMON',
      resident_id: '',
      applicant_name: '',
      purpose: 'BARANGAY_SUMMON',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 0, // No fee for summon
      barangay_case: '',
      for: '',
      to: '',
      summon_date: '',
      summon_time: '',
      summon_address: '',
      requirements_submitted: [],
      notes: '',
      remarks: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
    reset
  } = form;

  // Document form hook for API integration
  const documentForm = useDocumentForm({
    documentType: 'SUMMON',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Request Submitted',
        message: 'Barangay Summon has been created successfully'
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
    search: debouncedSearchTerm,
    per_page: 10
  });

  const residents = residentsData?.data || [];

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
      const fullAddress = selectedResident.complete_address;

      setValue('type', 'SUMMON');
      setValue('resident_id', selectedResident.id);
      setValue('applicant_name', fullName);
      setValue('applicant_address', fullAddress);
      setValue('applicant_contact', selectedResident.mobile_number || '');
      setValue('applicant_email', selectedResident.email_address || '');
      setValue('to', fullName); // Auto-fill the "To" field with resident name
      setValue('summon_address', fullAddress); // Auto-fill summon address with resident address
    }
  }, [selectedResident, setValue]);

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setValue('resident_id', resident.id);
    setValue('applicant_name', `${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    setSearchTerm(`${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
    setStep(2);
  };

  // Enhanced submit handler
  const onSubmit = handleSubmit(async (formData) => {
    if (!selectedResident) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a resident first'
      });
      return;
    }

    // Ensure resident_id is set
    if (!formData.resident_id) {
      formData.resident_id = selectedResident.id;
    }

    // Validate required summon fields
    if (!formData.barangay_case || !formData.for || !formData.to || 
        !formData.summon_date || !formData.summon_time || !formData.summon_address) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    // Debug: Log the form data being submitted
    console.log('Submitting form data:', formData);

    try {
      await documentForm.handleSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  // Handle certifying official change
  const handleCertifyingOfficialChange = (value: string) => {
    const currentRemarks = getValues('remarks') || '';
    const newRemarks = currentRemarks.replace(/Certifying Official: [^,]*/, '') + ` Certifying Official: ${value}`;
    setValue('remarks', newRemarks.trim());
  };

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select Respondent
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for respondent *
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter respondent's name..."
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

        {/* Always show "Add New Resident" option */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Can't find the respondent you're looking for?
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

        {/* Show specific message when no results found */}
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
      <form onSubmit={onSubmit} className={`space-y-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>

        {/* Respondent Information Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Respondent Information
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
              Change Respondent
            </button>
          </div>
        </div>

        {/* Summon Details Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Summon Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Barangay Case Number */}
            <DocumentFormField
              name="barangay_case"
              label="Barangay Case Number"
              type="text"
              placeholder="e.g., 25-17"
              required
            />

            {/* For (Complainant) */}
            <DocumentFormField
              name="for"
              label="For (Complainant)"
              type="text"
              placeholder="Enter complainant name"
              required
            />

            {/* To (Respondent) - Full Width */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="to"
                label="To (Respondent)"
                type="text"
                placeholder="Enter respondent name"
                required
              />
            </div>

            {/* Summon Date */}
            <DocumentFormField
              name="summon_date"
              label="Summon Date"
              type="date"
              required
            />

            {/* Summon Time */}
            <DocumentFormField
              name="summon_time"
              label="Summon Time"
              type="time"
              required
            />

            {/* Summon Address - Full Width */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="summon_address"
                label="Respondent Address"
                type="text"
                placeholder="Enter complete address"
                required
              />
            </div>

            {/* Certifying Official */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifying Official <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(e) => handleCertifyingOfficialChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                disabled={isLoadingOfficials}
                required
              >
                <option value="">
                  {isLoadingOfficials ? 'Loading officials...' : 'Select official'}
                </option>
                {officials.map((official) => {
                  const fullName = `${official.prefix ?? ""} ${official.first_name} ${official.middle_name ? official.middle_name + ' ' : ''}${official.last_name}${official.suffix ? ' ' + official.suffix : ''}`.trim();
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
                placeholder="Any additional details about the case or special instructions..."
                rows={3}
              />
            </div>
          </div>

          {/* Summon Info Display */}
          {watch('summon_date') && watch('summon_time') && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Summon Schedule:</p>
                  <p className="text-xs text-gray-600 mt-1">
                    The respondent is required to appear on {new Date(watch('summon_date')!).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {watch('summon_time')}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={documentForm.isSubmitting || !selectedResident}
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {documentForm.isSubmitting && (
                <LoadingSpinner size="sm" />
              )}
              <span>{documentForm.isSubmitting ? 'Creating Summon...' : 'Create Summon'}</span>
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );

  const renderStep3 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '200ms' }}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-darktext mb-2">Summon Created Successfully!</h2>
      <p className="text-gray-600 mb-6">
        The Barangay Summon has been created and is ready for issuance.
        The respondent will be notified of their required appearance.
      </p>

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
            reset({
              type: 'SUMMON',
              resident_id: '',
              applicant_name: '',
              purpose: 'BARANGAY_SUMMON',
              applicant_address: '',
              applicant_contact: '',
              applicant_email: '',
              priority: 'NORMAL',
              needed_date: '',
              processing_fee: 0,
              barangay_case: '',
              for: '',
              to: '',
              summon_date: '',
              summon_time: '',
              summon_address: '',
              requirements_submitted: [],
              notes: '',
              remarks: '',
            });
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Create Another Summon
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div className={`mb-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-2xl font-bold text-darktext">Barangay Summon</h1>
        <p className="text-gray-600 mt-1">Create a summon for barangay case hearing</p>
      </div>

      {/* Step Indicator */}
      <div className={`mb-8 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '100ms' }}>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepNumber
                  ? 'bg-smblue-400 text-white'
                  : step > stepNumber
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNumber ? <FiCheck /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-0.5 ${
                  step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-16 mt-2">
          <span className={`text-xs ${step === 1 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Select Respondent
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Fill Details
          </span>
          <span className={`text-xs ${step === 3 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Complete
          </span>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default SummonForm;