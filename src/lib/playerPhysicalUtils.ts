
/**
 * Utility functions for handling player physical attributes
 */

/**
 * Convert height in inches to feet and inches display format
 * @param inches Height in inches
 * @returns Formatted string like "6'2"" or "-" if no height
 */
export const formatHeight = (inches?: number): string => {
  if (!inches || inches <= 0) return '-';
  
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  return `${feet}'${remainingInches}"`;
};

/**
 * Format weight for display
 * @param weight Weight in pounds
 * @returns Formatted string like "180 lbs" or "-" if no weight
 */
export const formatWeight = (weight?: number): string => {
  if (!weight || weight <= 0) return '-';
  
  return `${weight} lbs`;
};

/**
 * Generate realistic height for a hockey player based on position
 * @param position Player position
 * @returns Height in inches
 */
export const generateHeight = (position: 'C' | 'LW' | 'RW' | 'D' | 'G'): number => {
  let minHeight: number;
  let maxHeight: number;
  
  switch (position) {
    case 'G': // Goalies - typically taller
      minHeight = 72; // 6'0"
      maxHeight = 76; // 6'4"
      break;
    case 'D': // Defensemen - generally taller
      minHeight = 70; // 5'10"
      maxHeight = 75; // 6'3"
      break;
    case 'C':
    case 'LW':
    case 'RW': // Forwards - more varied
      minHeight = 68; // 5'8"
      maxHeight = 74; // 6'2"
      break;
    default:
      minHeight = 68;
      maxHeight = 74;
  }
  
  return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
};

/**
 * Generate realistic weight for a hockey player based on position and height
 * @param position Player position
 * @param height Height in inches
 * @returns Weight in pounds
 */
export const generateWeight = (position: 'C' | 'LW' | 'RW' | 'D' | 'G', height: number): number => {
  let baseWeight: number;
  let variance: number;
  
  // Base weight calculation based on height
  const heightFactor = (height - 68) * 3; // 3 lbs per inch above 5'8"
  
  switch (position) {
    case 'G': // Goalies - heavier with padding consideration
      baseWeight = 185 + heightFactor;
      variance = 25;
      break;
    case 'D': // Defensemen - generally heavier
      baseWeight = 190 + heightFactor;
      variance = 30;
      break;
    case 'C':
    case 'LW':
    case 'RW': // Forwards - more varied
      baseWeight = 175 + heightFactor;
      variance = 25;
      break;
    default:
      baseWeight = 180 + heightFactor;
      variance = 25;
  }
  
  // Add random variance
  const randomVariance = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  const finalWeight = baseWeight + randomVariance;
  
  // Ensure reasonable bounds
  return Math.max(160, Math.min(250, finalWeight));
};
