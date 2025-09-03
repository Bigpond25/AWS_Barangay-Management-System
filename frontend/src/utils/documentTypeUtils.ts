// ============================================================================
// utils/documentTypeUtils.ts - Document type formatting utilities
// ============================================================================

import type { DocumentType } from '@/services/documents/documents.types';

// Document type configuration with human-readable labels and styling
export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  BARANGAY_CLEARANCE_INSTALLATION: {
    label: 'Barangay Clearance (Installation)',
    shortLabel: 'Clearance (Installation)',
    description: 'Barangay clearance for installation purposes',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  BARANGAY_CLEARANCE: {
    label: 'Barangay Clearance',
    shortLabel: 'Clearance',
    description: 'General barangay clearance certificate',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  BUSINESS_PERMIT: {
    label: 'Business Permit',
    shortLabel: 'Business Permit',
    description: 'Business operation permit',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  BUSINESS_SIGN_CLEARANCE: {
    label: 'Business Sign Clearance',
    shortLabel: 'Sign Clearance',
    description: 'Business signage clearance permit',
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
  CERTIFICATE_OF_INDIGENCY: {
    label: 'Certificate of Indigency',
    shortLabel: 'Indigency Cert.',
    description: 'Certificate of indigency for financial assistance',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  CERTIFICATE_OF_RESIDENCY: {
    label: 'Certificate of Residency',
    shortLabel: 'Residency Cert.',
    description: 'Certificate of residency',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  CASH_BOND: {
    label: 'Cash Bond',
    shortLabel: 'Cash Bond',
    description: 'Cash bond deposit receipt',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  SUMMON: {
    label: 'Summon',
    shortLabel: 'Summon',
    description: 'Legal summon document',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  NOTICE_OF_HEARING: {
    label: 'Notice of Hearing',
    shortLabel: 'Hearing Notice',
    description: 'Notice of hearing for legal proceedings',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
  RETIREMENT_CESSATION_DISSOLUTION: {
    label: 'Retirement/Cessation/Dissolution',
    shortLabel: 'Retirement/Cessation',
    description: 'Business retirement, cessation, or dissolution certificate',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
};

/**
 * Format document type constant to human-readable text
 */
export const formatDocumentType = (type: DocumentType | string): string => {
  const config = DOCUMENT_TYPE_CONFIG[type as DocumentType];
  if (config) {
    return config.label;
  }
  
  // Fallback for unknown types - convert underscores to spaces and title case
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get short label for document type
 */
export const getDocumentTypeShortLabel = (type: DocumentType | string): string => {
  const config = DOCUMENT_TYPE_CONFIG[type as DocumentType];
  if (config) {
    return config.shortLabel;
  }
  
  // Fallback for unknown types
  return formatDocumentType(type);
};

/**
 * Get document type description
 */
export const getDocumentTypeDescription = (type: DocumentType | string): string => {
  const config = DOCUMENT_TYPE_CONFIG[type as DocumentType];
  if (config) {
    return config.description;
  }
  
  // Fallback for unknown types
  return `${formatDocumentType(type)} document`;
};

/**
 * Get document type styling configuration
 */
export const getDocumentTypeConfig = (type: DocumentType | string) => {
  const config = DOCUMENT_TYPE_CONFIG[type as DocumentType];
  if (config) {
    return config;
  }
  
  // Fallback styling for unknown types
  return {
    label: formatDocumentType(type),
    shortLabel: formatDocumentType(type),
    description: `${formatDocumentType(type)} document`,
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  };
};

/**
 * Check if document type is a certificate
 */
export const isCertificateType = (type: DocumentType | string): boolean => {
  return type.includes('CERTIFICATE') || type.includes('CLEARANCE');
};

/**
 * Check if document type is business-related
 */
export const isBusinessType = (type: DocumentType | string): boolean => {
  return type.includes('BUSINESS');
};

/**
 * Check if document type is legal-related
 */
export const isLegalType = (type: DocumentType | string): boolean => {
  return ['SUMMON', 'NOTICE_OF_HEARING', 'CASH_BOND'].includes(type);
};

/**
 * Get document type category
 */
export const getDocumentTypeCategory = (type: DocumentType | string): string => {
  if (isBusinessType(type)) return 'Business';
  if (isLegalType(type)) return 'Legal';
  if (isCertificateType(type)) return 'Certificate';
  return 'Other';
};
