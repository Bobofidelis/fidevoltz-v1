export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// Check password strength
export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels: PasswordStrength['label'][] = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  const colors = [
    'text-red-600',
    'text-orange-600',
    'text-yellow-600',
    'text-blue-600',
    'text-green-600',
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

// Validate password requirements
export function validatePasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };
}

// Check if password meets all requirements
export function isPasswordValid(password: string): boolean {
  const reqs = validatePasswordRequirements(password);
  return reqs.minLength && reqs.hasUppercase && reqs.hasLowercase && reqs.hasNumber;
}

// Check if passwords match
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}
