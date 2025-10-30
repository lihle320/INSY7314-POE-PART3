export const regex = {
  fullName: /^[A-Za-z\s'\-]{2,100}$/,
  idNumber: /^\d{6,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  accountNumber: /^\d{8,20}$/,
  swiftCode: /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  currency: /^[A-Z]{3}$/,
  amount: /^\d+(\.\d{1,2})?$/
};
