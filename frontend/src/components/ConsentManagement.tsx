import { useState, useEffect, useCallback } from 'react';
import { Shield, Info, Eye, X, Check } from 'lucide-react';

// Simple toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Simple implementation - can be replaced with a proper toast system
  if (type === 'error') {
    alert(`Error: ${message}`);
  } else {
    alert(`Success: ${message}`);
  }
};

interface ConsentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface UserConsent {
  id: string;
  consent_type: string;
  consented: boolean;
  consented_at: string | null;
  withdrawn_at: string | null;
  consent_version: string;
}

const CONSENT_TYPES: ConsentType[] = [
  {
    id: 'registration',
    name: 'Registration and Account Creation',
    description: 'Allows us to create and maintain your account for accessing barangay services.',
    required: true
  },
  {
    id: 'data_processing',
    name: 'Personal Data Processing',
    description: 'Permits processing of your personal information for service delivery and compliance.',
    required: true
  },
  {
    id: 'analytics',
    name: 'Analytics and Performance',
    description: 'Helps us improve our services by analyzing usage patterns (anonymized data).',
    required: false
  },
  {
    id: 'marketing',
    name: 'Marketing Communications',
    description: 'Allows us to send you updates about new services and community announcements.',
    required: false
  },
  {
    id: 'cookies',
    name: 'Cookies and Tracking',
    description: 'Enables enhanced functionality and user experience through browser cookies.',
    required: false
  }
];

export default function ConsentManagement() {
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUserConsents = useCallback(async () => {
    try {
      const response = await fetch('/api/consents/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
      showToast('Failed to load consent information', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserConsents();
  }, [fetchUserConsents]);

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    setUpdating(consentType);

    try {
      if (granted) {
        // Record consent
        const response = await fetch('/api/consents/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            consent_type: consentType,
            consent_version: '1.0',
            consent_data: {
              source: 'settings_page',
              timestamp: new Date().toISOString()
            }
          })
        });

        if (response.ok) {
          showToast('Consent granted successfully');
          fetchUserConsents();
        } else {
          throw new Error('Failed to record consent');
        }
      } else {
        // Withdraw consent
        const existingConsent = consents.find(c => c.consent_type === consentType && c.consented);
        if (existingConsent) {
          const response = await fetch(`/api/consents/${existingConsent.id}/withdraw`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              withdrawal_reason: 'User choice via settings'
            })
          });

          if (response.ok) {
            showToast('Consent withdrawn successfully');
            fetchUserConsents();
          } else {
            throw new Error('Failed to withdraw consent');
          }
        }
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      showToast('Failed to update consent preference', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getConsentStatus = (consentType: string) => {
    const consent = consents.find(c => c.consent_type === consentType && c.consented && !c.withdrawn_at);
    return consent !== undefined;
  };

  const getConsentDate = (consentType: string) => {
    const consent = consents.find(c => c.consent_type === consentType && c.consented);
    return consent?.consented_at ? new Date(consent.consented_at).toLocaleDateString() : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy Consents</h2>
          <p className="text-gray-600">Manage your data privacy preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5" />
            Important Information
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-2">
            Your privacy is important to us. You can control how your data is used by managing these consent preferences.
            Some consents are required for basic functionality, while others are optional.
          </p>
          <p className="text-sm text-gray-600">
            You can withdraw your consent at any time, though this may affect your ability to use certain features.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {CONSENT_TYPES.map((consentType) => {
          const isGranted = getConsentStatus(consentType.id);
          const consentDate = getConsentDate(consentType.id);
          const isUpdating = updating === consentType.id;

          return (
            <div key={consentType.id} className="bg-white rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{consentType.name}</h3>
                      {consentType.required && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Required</span>
                      )}
                      {isGranted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                          <X className="h-3 w-3 mr-1" />
                          Not Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{consentType.description}</p>
                    {consentDate && (
                      <p className="text-xs text-gray-500">
                        Granted on: {consentDate}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={consentType.id}
                        checked={isGranted}
                        disabled={isUpdating || (consentType.required && isGranted)}
                        onChange={(e) => 
                          handleConsentChange(consentType.id, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label 
                        htmlFor={consentType.id}
                        className="text-sm font-medium leading-none text-gray-700"
                      >
                        {isGranted ? 'Granted' : 'Grant'}
                      </label>
                    </div>
                    {consentType.required && isGranted && (
                      <p className="text-xs text-gray-500 mt-1">
                        Required for service
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Data Rights</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Under data protection laws, you have the following rights:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Right to access your personal data</li>
              <li>• Right to rectify (correct) your personal data</li>
              <li>• Right to erase your personal data</li>
              <li>• Right to restrict processing of your personal data</li>
              <li>• Right to data portability</li>
              <li>• Right to object to processing</li>
            </ul>
            <div className="pt-3 border-t">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Eye className="h-4 w-4 mr-2" />
                Download My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
