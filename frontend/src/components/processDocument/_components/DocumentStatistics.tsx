// ============================================================================
// components/processDocument/_components/DocumentStatistics.tsx
// ============================================================================

import React from 'react';
import { FiClock, FiEye, FiCheck, FiFileText, FiX, FiSlash } from 'react-icons/fi';
import StatCard from '@/components/_global/StatCard';

interface DocumentStatisticsProps {
  statusCounts: {
    PENDING: number;
    PROCESSING: number;
    APPROVED: number;
    RELEASED: number;
    REJECTED: number;
    CANCELLED: number;
  };
  isLoading: boolean;
  isLoaded: boolean;
}

export const DocumentStatistics: React.FC<DocumentStatisticsProps> = ({
  statusCounts,
  isLoading,
  isLoaded,
}) => {
  const statsData = [
    { 
      title: 'Pending Documents', 
      value: statusCounts.PENDING || 0, 
      icon: FiClock 
    },
    { 
      title: 'Processing Documents', 
      value: statusCounts.PROCESSING || 0, 
      icon: FiEye 
    },
    { 
      title: 'Approved Documents', 
      value: statusCounts.APPROVED || 0, 
      icon: FiCheck 
    },
    { 
      title: 'Released Documents', 
      value: statusCounts.RELEASED || 0, 
      icon: FiFileText 
    },
    { 
      title: 'Rejected Documents', 
      value: statusCounts.REJECTED || 0, 
      icon: FiX 
    },
    { 
      title: 'Cancelled Documents', 
      value: statusCounts.CANCELLED || 0, 
      icon: FiSlash 
    }
  ];

  return (
    <section className={`w-full bg-white flex flex-col gap-3 border p-6 rounded-2xl border-gray-100 shadow-sm mb-6 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
        Document Statistics
      </h3>
      
      {isLoading ? (
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-24"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {statsData.map((stat, index) => (
            <div
              key={stat.title}
              className={`transition-all duration-700 ease-out ${
                isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{ 
                transitionDelay: `${450 + (index * 100)}ms`,
                transformOrigin: 'center bottom'
              }}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DocumentStatistics;
