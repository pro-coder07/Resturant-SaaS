export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && isLongEnough;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};
