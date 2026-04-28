// Email: standard format
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

// Password rules
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'At least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Include at least one special character (!@#$...)';
  return '';
};

// Password strength score 0-4
export const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return score;
};

export const strengthLabel = (score) => {
  if (score === 0) return { label: '', color: '' };
  if (score === 1) return { label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { label: 'Fair', color: 'bg-yellow-500' };
  if (score === 3) return { label: 'Good', color: 'bg-blue-500' };
  return { label: 'Strong', color: 'bg-green-500' };
};
