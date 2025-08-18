/**
 * Utility functions for age calculations
 */

/**
 * Calculate age from birth date string
 */
export const calculateAge = (birthDate: string | Date): number => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return 0;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
};

/**
 * Get age from resident, with fallback calculation
 */
export const getResidentAge = (resident: { age?: number; birth_date: string }): number => {
  // Use the computed age if available, otherwise calculate from birth_date
  return resident.age ?? calculateAge(resident.birth_date);
};

/**
 * Format age for display
 */
export const formatAge = (age: number): string => {
  return `${age} year${age !== 1 ? 's' : ''} old`;
};
