import rateLimit from 'express-rate-limit';
//this file sets up rate limiting to prevent abuse of the API/DDodS attacks by limiting number of 
// requests from a single IP (procademy,2025)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false, 
    message: 'Too many authentication attempts'
  }
});

export { generalLimiter, authLimiter };