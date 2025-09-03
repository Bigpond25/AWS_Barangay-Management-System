// ============================================================================
// components/__shared/DocumentTypeBadge.tsx - Document type badge component
// ============================================================================

import React from 'react';
import type { DocumentType } from '@/services/documents/documents.types';
import { getDocumentTypeConfig, formatDocumentType, getDocumentTypeShortLabel } from '@/utils/documentTypeUtils';

interface DocumentTypeBadgeProps {
  type: DocumentType | string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showTooltip?: boolean;
  useShortLabel?: boolean;
  className?: string;
}

export const DocumentTypeBadge: React.FC<DocumentTypeBadgeProps> = ({
  type,
  size = 'md',
  variant = 'default',
  showTooltip = true,
  useShortLabel = false,
  className = '',
}) => {
  const config = getDocumentTypeConfig(type);
  const label = useShortLabel ? getDocumentTypeShortLabel(type) : formatDocumentType(type);
  
  // Size configurations
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };
  
  // Variant configurations
  const variantClasses = {
    default: `${config.bgColor} ${config.color} ${config.borderColor} border`,
    outline: `border-2 ${config.borderColor} ${config.color} bg-white`,
    solid: `${config.bgColor} ${config.color} border-transparent border`,
  };
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full whitespace-nowrap';
  
  const allClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');
  
  const BadgeContent = (
    <span className={allClasses}>
      {label}
    </span>
  );
  
  // Add tooltip if enabled
  if (showTooltip && config.description) {
    return (
      <div className="relative group">
        {BadgeContent}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }
  
  return BadgeContent;
};

export default DocumentTypeBadge;
