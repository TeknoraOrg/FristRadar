export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain a special character';
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 1) return 'Name is too short';
  if (name.trim().length > 100) return 'Name is too long';
  return null;
}
