// ============================================================================
// NoticeOfHearingForm.tsx - Notice of Hearing Request Form
// ============================================================================

import { useDebounce } from '@/hooks/useDebounce';
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch, FiUser, FiCheck, FiArrowLeft, FiAlertCircle, FiCalendar, FiBook } from 'react-icons/fi';

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

interface NoticeOfHearingFormProps {
  onNavigate: (page: string) => void;
}

const NoticeOfHearingForm: React.FC<NoticeOfHearingFormProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [selectedComplainant, setSelectedComplainant] = useState<Resident | null>(null);
  const [selectedRespondent, setSelectedRespondent] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchType, setSearchType] = useState<'complainant' | 'respondent'>('complainant');
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotifications();

  // React Hook Form setup with Zod validation
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentFormDataSchema),
    defaultValues: {
      type: 'NOTICE_OF_HEARING',
      resident_id: '',
      applicant_name: '',
      applicant_address: '',
      applicant_contact: '',
      applicant_email: '',
      priority: 'NORMAL',
      needed_date: '',
      processing_fee: 0, // Usually free for barangay cases
      purpose: 'Legal Proceedings', // Add this required field
      case_number: '',
      case_title: '',
      hearing_date: '',
      hearing_time: '',
      hearing_type: 'MEDIATION',
      complainant_name: '',
      complainant_address: '',
      respondent_name: '',
      respondent_address: '',
      case_description: '',
      requirements_submitted: ['Valid ID', 'Complaint Form'],
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
    documentType: 'NOTICE_OF_HEARING',
    onSuccess: (_document) => {
      showNotification({
        type: 'success',
        title: 'Notice Scheduled',
        message: 'Notice of Hearing has been scheduled successfully'
      });
      setStep(3); // Move to confirmation step
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        title: 'Scheduling Failed',
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

  // Static data for form options
  const hearingTypeOptions = [
    'MEDIATION',
    'CONCILIATION',
    'ARBITRATION',
    'SETTLEMENT_CONFERENCE',
    'FAILURE_TO_APPEAR'
  ];

  const caseTypeOptions = [
    'Sum of Money',
    'Eviction',
    'Property Dispute',
    'Noise Complaint',
    'Boundary Dispute',
    'Defamation',
    'Physical Injury',
    'Damage to Property',
    'Breach of Contract',
    'Other'
  ];

  // Fetch active barangay officials for the presiding official dropdown
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

  // Update form when complainant is selected
  useEffect(() => {
    if (selectedComplainant) {
      const fullName = `${selectedComplainant.first_name} ${selectedComplainant.middle_name || ''} ${selectedComplainant.last_name}`.trim();
      
      setValue('resident_id', selectedComplainant.id);
      setValue('applicant_name', fullName);
      setValue('applicant_address', selectedComplainant.complete_address);
      setValue('applicant_contact', selectedComplainant.mobile_number || '');
      setValue('applicant_email', selectedComplainant.email_address || '');
      setValue('complainant_name', fullName);
      setValue('complainant_address', selectedComplainant.complete_address);
    }
  }, [selectedComplainant, setValue]);

  // Update form when respondent is selected
  useEffect(() => {
    if (selectedRespondent) {
      const fullName = `${selectedRespondent.first_name} ${selectedRespondent.middle_name || ''} ${selectedRespondent.last_name}`.trim();
      
      setValue('respondent_name', fullName);
      setValue('respondent_address', selectedRespondent.complete_address);
    }
  }, [selectedRespondent, setValue]);

  const handleResidentSelect = (resident: Resident) => {
    if (searchType === 'complainant') {
      setSelectedComplainant(resident);
      setSearchTerm(`${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
      // After selecting complainant, switch to respondent search
      setSearchType('respondent');
      setSearchTerm('');
    } else {
      setSelectedRespondent(resident);
      setSearchTerm(`${resident.first_name} ${resident.middle_name || ''} ${resident.last_name}`.trim());
      setStep(2);
    }
  };

  // Watch form values for validation
  const watchedValues = watch([
    'case_number',
    'case_title', 
    'hearing_type',
    'hearing_date',
    'hearing_time',
    'case_description'
  ]);

  // Enhanced submit handler using the working pattern from CertificateOfResidencyForm
  const onSubmit = async (formData: DocumentFormData) => {
    console.log('=== SUBMIT BUTTON CLICKED ===');
    console.log('Form Data:', formData);
    console.log('Selected Complainant:', selectedComplainant);
    console.log('Selected Respondent:', selectedRespondent);
    console.log('Form Valid (RHF):', isValid);
    console.log('Form Errors:', errors);
    console.log('All Values:', getValues());
    console.log('============================');

    if (!selectedComplainant || !selectedRespondent) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select both complainant and respondent'
      });
      return;
    }

    try {
      await documentForm.handleSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showNotification({
        type: 'error',
        title: 'Submission Error',
        message: `Failed to create document: ${errorMessage}`
      });
    }
  };

  // Generate case number
  const generateCaseNumber = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 100) + 1;
    const caseNum = `${randomNum.toString().padStart(2, '0')}-${currentYear.toString().slice(-2)}`;
    setValue('case_number', caseNum);
  };

  const renderStep1 = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '200ms' }}>
      <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
        Select {searchType === 'complainant' ? 'Complainant' : 'Respondent'}
      </h2>

      {selectedComplainant && searchType === 'respondent' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Complainant Selected:</strong> {selectedComplainant.first_name} {selectedComplainant.last_name}
          </p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for {searchType} *
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Enter ${searchType}'s name...`}
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
              Can't find the {searchType} you're looking for?
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

        {/* Back button for respondent selection */}
        {searchType === 'respondent' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchType('complainant');
                setSearchTerm(selectedComplainant ? `${selectedComplainant.first_name} ${selectedComplainant.last_name}` : '');
              }}
              className="inline-flex items-center text-sm text-smblue-400 hover:text-smblue-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Change Complainant
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '300ms' }}>

        {/* Parties Information Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Case Parties
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complainant */}
            {selectedComplainant && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h3 className="font-medium text-green-800 mb-2">Complainant</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="text-sm text-gray-900">
                      {selectedComplainant.first_name} {selectedComplainant.middle_name} {selectedComplainant.last_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="text-sm text-gray-900">{selectedComplainant.complete_address}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Respondent */}
            {selectedRespondent && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-medium text-red-800 mb-2">Respondent</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="text-sm text-gray-900">
                      {selectedRespondent.first_name} {selectedRespondent.middle_name} {selectedRespondent.last_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="text-sm text-gray-900">{selectedRespondent.complete_address}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center text-sm text-smblue-400 hover:text-smblue-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-1" />
              Change Parties
            </button>
          </div>
        </div>

        {/* Case Details Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            Case Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purpose Field */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="purpose"
                label="Purpose"
                type="text"
                placeholder="Purpose of the notice of hearing (e.g., Legal Proceedings, Dispute Resolution)"
                required
              />
            </div>

            {/* Case Number with Generator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Number <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <DocumentFormField
                  name="case_number"
                  label=""
                  type="text"
                  placeholder="XX-XX"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={generateCaseNumber}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Case Type/Title */}
            <DocumentFormField
              name="case_title"
              label="Case For"
              type="select"
              options={caseTypeOptions.map(type => ({ value: type, label: type }))}
              placeholder="Select case type"
              required
            />

            {/* Hearing Type */}
            <DocumentFormField
              name="hearing_type"
              label="Hearing Type"
              type="select"
              options={hearingTypeOptions.map(type => ({ 
                value: type, 
                label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
              }))}
              placeholder="Select hearing type"
              required
            />

            {/* Hearing Date */}
            <DocumentFormField
              name="hearing_date"
              label="Hearing Date"
              type="date"
              required
            />

            {/* Hearing Time */}
            <DocumentFormField
              name="hearing_time"
              label="Hearing Time"
              type="time"
              required
            />

            {/* Presiding Official */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presiding Official <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register('remarks')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-200 focus:border-smblue-200"
                disabled={isLoadingOfficials}
              >
                <option value="">
                  {isLoadingOfficials ? 'Loading officials...' : 'Select presiding official'}
                </option>
                {officials.map((official) => {
                  const fullName = `${official.first_name} ${official.middle_name ? official.middle_name + ' ' : ''}${official.last_name}`.trim();
                  const positionText = official.position.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={official.id} value={`${fullName} - ${positionText}`}>
                      {fullName} ({positionText})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Case Description */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="case_description"
                label="Case Description"
                type="textarea"
                placeholder="Brief description of the case..."
                rows={3}
                required
              />
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <DocumentFormField
                name="notes"
                label="Additional Instructions/Notes"
                type="textarea"
                placeholder="Any special instructions or notes for the hearing..."
                rows={2}
              />
            </div>
          </div>

          {/* Hearing Information Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <FiBook className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Hearing Information
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Both parties must appear on the scheduled date and time</li>
                    <li>Bring all relevant documents and evidence</li>
                    <li>Failure to appear may result in dismissal or default judgment</li>
                    <li>Hearing will be conducted at the Barangay Hall</li>
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
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('BYPASSING VALIDATION TEST');
                onSubmit(getValues() as DocumentFormData);
              }}
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors flex items-center space-x-2"
            >
              {documentForm.isSubmitting && (
                <LoadingSpinner size="sm" />
              )}
              <span>{documentForm.isSubmitting ? 'Scheduling...' : 'Schedule Hearing'}</span>
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

      <h2 className="text-xl font-semibold text-darktext mb-2">Hearing Scheduled Successfully!</h2>
      <p className="text-gray-600 mb-6">
        The Notice of Hearing has been scheduled and both parties will be notified.
      </p>

      {selectedComplainant && selectedRespondent && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Hearing Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Case Number:</strong> {watch('case_number')}</p>
            <p><strong>Case Type:</strong> {watch('case_title')}</p>
            <p><strong>Complainant:</strong> {selectedComplainant.first_name} {selectedComplainant.last_name}</p>
            <p><strong>Respondent:</strong> {selectedRespondent.first_name} {selectedRespondent.last_name}</p>
            <p><strong>Hearing Date:</strong> {watch('hearing_date')}</p>
            <p><strong>Hearing Time:</strong> {watch('hearing_time')}</p>
            <p><strong>Hearing Type:</strong> {watch('hearing_type')}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <FiCalendar className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3 text-left">
            <h3 className="text-sm font-medium text-blue-800">
              Next Steps
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Both parties will receive formal notice</li>
                <li>Prepare all relevant documents and evidence</li>
                <li>Attend the hearing at the scheduled time</li>
                <li>Contact the barangay office for any changes</li>
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
            setSelectedComplainant(null);
            setSelectedRespondent(null);
            setSearchTerm('');
            setSearchType('complainant');
            reset();
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Schedule Another Hearing
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
        <h1 className="text-2xl font-bold text-darktext">Notice of Hearing</h1>
        <p className="text-gray-600 mt-1">Schedule a barangay hearing for case resolution</p>
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
            Select Parties
          </span>
          <span className={`text-xs ${step === 2 ? 'text-smblue-400 font-medium' : 'text-gray-500'}`}>
            Case Details
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

export default NoticeOfHearingForm;