// Validation utility functions for forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Additional checks for common email issues
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  if (email.includes('..')) {
    return { isValid: false, error: 'Email address cannot contain consecutive dots' };
  }

  return { isValid: true };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Check for valid US phone number (10 or 11 digits)
  if (digitsOnly.length === 10) {
    // Standard 10-digit US number
    return { isValid: true };
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // 11-digit number starting with country code 1
    return { isValid: true };
  } else {
    return { 
      isValid: false, 
      error: 'Please enter a valid US phone number (10 digits)' 
    };
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const tenDigits = digitsOnly.slice(1);
    return `+1 (${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`;
  }
  
  return phone; // Return original if can't format
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return { 
      isValid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }

  return { isValid: true };
};

// Date of birth validation
export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
  if (!dateOfBirth || dateOfBirth.trim() === '') {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Check if person is at least 18 years old
  const minAge = new Date();
  minAge.setFullYear(today.getFullYear() - 18);
  
  if (birthDate > minAge) {
    return { isValid: false, error: 'Participant must be at least 18 years old' };
  }

  return { isValid: true };
};

// Emergency contact phone validation (optional field)
export const validateEmergencyPhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: true }; // Emergency phone is optional
  }

  return validatePhone(phone);
};

// Comprehensive form validation
export const validateRegistrationForm = (formData: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate first name
  const firstNameResult = validateName(formData.firstName, 'First name');
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error!;
  }

  // Validate last name
  const lastNameResult = validateName(formData.lastName, 'Last name');
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error!;
  }

  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  // Validate phone
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.error!;
  }

  // Validate date of birth
  const dobResult = validateDateOfBirth(formData.dateOfBirth);
  if (!dobResult.isValid) {
    errors.dateOfBirth = dobResult.error!;
  }

  // Validate emergency contact phone if provided
  if (formData.emergencyContactPhone) {
    const emergencyPhoneResult = validateEmergencyPhone(formData.emergencyContactPhone);
    if (!emergencyPhoneResult.isValid) {
      errors.emergencyContactPhone = emergencyPhoneResult.error!;
    }
  }

  // Validate emergency contact name if phone is provided
  if (formData.emergencyContactPhone && !formData.emergencyContactName?.trim()) {
    errors.emergencyContactName = 'Emergency contact name is required when phone is provided';
  }

  // Validate parent/guardian information for waiver
  if (formData.waiverAccepted) {
    const parentNameResult = validateName(formData.parentGuardianName, 'Parent/Guardian name');
    if (!parentNameResult.isValid) {
      errors.parentGuardianName = parentNameResult.error!;
    }

    if (!formData.parentGuardianSignature?.trim()) {
      errors.parentGuardianSignature = 'Digital signature is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
