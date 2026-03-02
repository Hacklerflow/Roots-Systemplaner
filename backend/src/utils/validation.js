/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (min 6 characters)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate project name
 */
export const isValidProjectName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 255;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  return str ? str.trim() : '';
};
