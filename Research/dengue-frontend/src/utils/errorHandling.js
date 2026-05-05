/**
 * Utility functions for handling API errors and validation
 */

/**
 * Parse API error response into a user-friendly message
 * @param {Error} error - The error object from axios
 * @returns {string} - Formatted error message
 */
export const parseApiError = (error) => {
  let errorMessage = 'Failed to submit report. Please try again.';
  
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // Handle duplicate error specially
    if (typeof detail === 'object' && detail.error_code === 'DUPLICATE_REPORT') {
      const existingReports = detail.existing_reports || [];
      const reportList = existingReports.map(r => `${r.report_id} (${r.date})`).join(', ');
      errorMessage = `${detail.message}\n\nExisting report(s): ${reportList}\n\nPlease check if this is a duplicate or use a different report ID.`;
    } else if (typeof detail === 'string') {
      errorMessage = detail;
    } else if (Array.isArray(detail)) {
      // Handle Pydantic validation errors
      const validationErrors = detail.map(err => {
        const field = Array.isArray(err.loc) ? err.loc.join('.') : err.loc;
        return `${field}: ${err.msg}`;
      }).join('\n');
      errorMessage = `Validation failed:\n${validationErrors}`;
    }
  } else if (error.response?.status === 422) {
    errorMessage = 'The data you entered has validation errors. Please check all fields and try again.';
  } else if (error.response?.status === 400) {
    errorMessage = 'Bad request. Please check your input data.';
  } else if (error.response?.status === 500) {
    errorMessage = 'Server error. Please try again later or contact support.';
  } else if (!error.response) {
    errorMessage = 'Network error. Please check your connection and try again.';
  }
  
  return errorMessage;
};

/**
 * Validate date field for all forms
 * @param {string} date - The date string
 * @returns {string|null} - Error message or null if valid
 */
export const validateDate = (date) => {
  if (!date) {
    return 'Report date is required';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  if (selectedDate > tomorrow) {
    return 'Date cannot be more than 1 day in the future';
  }
  
  return null;
};

/**
 * Validate GN code selection
 * @param {string} gnCode - The selected GN code
 * @returns {string|null} - Error message or null if valid
 */
export const validateGNCode = (gnCode) => {
  if (!gnCode) {
    return 'Please select a GN Division from the dropdown';
  }
  return null;
};

/**
 * Validate numeric field
 * @param {string|number} value - The numeric value
 * @param {string} fieldName - Name of the field for error messages
 * @param {object} options - Validation options
 * @returns {string|null} - Error message or null if valid
 */
export const validateNumericField = (value, fieldName, options = {}) => {
  const { 
    required = true, 
    min = 0, 
    max = null, 
    allowZero = true,
    maxWarningValue = null 
  } = options;
  
  if (value === '' || value === null || value === undefined) {
    if (required) {
      return `Please enter the ${fieldName.toLowerCase()}${allowZero ? ' (enter 0 if none)' : ''}`;
    }
    return null;
  }
  
  const numValue = parseInt(value);
  
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  
  if (numValue < min) {
    return `${fieldName} must be ${min} or greater`;
  }
  
  if (!allowZero && numValue === 0) {
    return `${fieldName} must be greater than 0`;
  }
  
  if (max !== null && numValue > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  
  if (maxWarningValue !== null && numValue > maxWarningValue) {
    return `${fieldName} seems very high (${numValue}). Please verify this number.`;
  }
  
  return null;
};

/**
 * Validate GPS coordinates
 * @param {string|number} latitude - Latitude value
 * @param {string|number} longitude - Longitude value
 * @returns {object} - Object with latitude and longitude errors
 */
export const validateCoordinates = (latitude, longitude) => {
  const errors = {};
  
  if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    errors.latitude = 'Latitude must be a number between -90 and 90';
  }
  
  if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    errors.longitude = 'Longitude must be a number between -180 and 180';
  }
  
  return errors;
};