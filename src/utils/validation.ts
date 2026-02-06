export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateForm(data: Record<string, string>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field] || '';
    const trimmedValue = value.trim();

    // Required validation
    if (rule.required && !trimmedValue) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!trimmedValue && !rule.required) {
      continue;
    }

    // Min length validation
    if (rule.minLength && trimmedValue.length < rule.minLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
      continue;
    }

    // Max length validation
    if (rule.maxLength && trimmedValue.length > rule.maxLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`;
      continue;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(trimmedValue)) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
      continue;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(trimmedValue);
      if (customError) {
        errors[field] = customError;
        continue;
      }
    }
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstError(errors: ValidationErrors): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}