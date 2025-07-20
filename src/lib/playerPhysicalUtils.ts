/**
 * Utility functions for player height and weight formatting and generation
 */

/**
 * Convert height in inches to feet and inches format
 * @param inches - Height in inches
 * @returns Formatted string like "6'2""
 */
export const formatHeight = (inches: number): string => {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

/**
 * Convert height from feet and inches to total inches
 * @param feet - Number of feet
 * @param inches - Number of inches
 * @returns Total height in inches
 */
export const heightToInches = (feet: number, inches: number): number => {
  return feet * 12 + inches;
};

/**
 * Format weight with "lbs" suffix
 * @param weight - Weight in pounds
 * @returns Formatted string like "185 lbs"
 */
export const formatWeight = (weight: number): string => {
  return `${weight} lbs`;
};

/**
 * Generate realistic height and weight based on hockey position
 */
export const generatePhysicalStats = (position: string) => {
  let heightRange: { min: number; max: number };
  let weightRange: { min: number; max: number };

  switch (position) {
    case 'G': // Goalies
      heightRange = { min: 72, max: 76 }; // 6'0" to 6'4"
      weightRange = { min: 180, max: 220 };
      break;
    case 'D': // Defensemen
      heightRange = { min: 70, max: 75 }; // 5'10" to 6'3"
      weightRange = { min: 190, max: 230 };
      break;
    case 'C': // Centers
    case 'LW': // Left Wing
    case 'RW': // Right Wing
    default: // Forwards
      heightRange = { min: 68, max: 74 }; // 5'8" to 6'2"
      weightRange = { min: 170, max: 210 };
      break;
  }

  // Generate height with normal distribution (bell curve)
  const heightMean = (heightRange.min + heightRange.max) / 2;
  const heightStdDev = (heightRange.max - heightRange.min) / 6; // 99.7% within range
  let height = Math.round(normalRandom(heightMean, heightStdDev));
  height = Math.max(heightRange.min, Math.min(heightRange.max, height));

  // Generate weight based on height with some variation
  // Taller players tend to be heavier, but with variation
  const heightFactor = (height - heightRange.min) / (heightRange.max - heightRange.min);
  const baseWeight = weightRange.min + (weightRange.max - weightRange.min) * heightFactor;
  const weightVariation = 15; // +/- 15 lbs variation
  let weight = Math.round(baseWeight + (Math.random() - 0.5) * 2 * weightVariation);
  weight = Math.max(weightRange.min, Math.min(weightRange.max, weight));

  return { height, weight };
};

/**
 * Generate a random number with normal (Gaussian) distribution
 * Uses Box-Muller transformation
 */
function normalRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Get BMI category for a player (optional, for future use)
 * @param heightInches - Height in inches
 * @param weightLbs - Weight in pounds
 * @returns BMI value
 */
export const calculateBMI = (heightInches: number, weightLbs: number): number => {
  const heightMeters = heightInches * 0.0254;
  const weightKg = weightLbs * 0.453592;
  return weightKg / (heightMeters * heightMeters);
};

/**
 * Validate height is within realistic hockey player range
 */
export const isValidHeight = (inches: number): boolean => {
  return inches >= 60 && inches <= 84; // 5'0" to 7'0"
};

/**
 * Validate weight is within realistic hockey player range
 */
export const isValidWeight = (pounds: number): boolean => {
  return pounds >= 140 && pounds <= 280;
};
