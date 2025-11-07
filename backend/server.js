import express from 'express';
import https from 'https'; //(Orlov, 2020)
import http from 'http'; 
import fs from 'fs';
import helmet from 'helmet'; //(WebDevBob ,2023)
import dotenv from 'dotenv';
import hpp from 'hpp';//(procademy,2024)  
dotenv.config();
import cookieParser from 'cookie-parser'; 
import session from 'express-session';
import csurf from 'csurf';
import { generalLimiter, authLimiter } from './config/rateLimit.js';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js'; 
import userRoutes from './routes/userRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import employeeRoutes from './routes/empolyeeRoute.js'; 

// error for handling 404 errors (freeCodeCamp.org ,2025)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Error Handler  (freeCodeCamp.org ,2025)
const errorHandler = (err, req, res, next) => {
    // Check if the error is already handled by the CSRF handler  (Imran Codes ,2025)
    if (err.code === 'EBADCSRFTOKEN') {
        return; // Prevents the CSRF error from being processed twice (Imran Codes ,2025)
    }
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// Connect to the database (freeCodeCamp.org ,2025)
connectDB(); 

const app = express(); //(freeCodeCamp.org ,2025)

// Helmet (WebDevBob ,2023 & Ivanov, 2020)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], 
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://localhost:5173"] 
    }
  }
}));

app.use(express.json()); //(freeCodeCamp.org ,2025)

//HTTP Parameter Pollution protection (procademy,2024)
app.use(hpp());

// General rate limiting for all routes
app.use(generalLimiter);

// CORS allow requests from frontend (freeCodeCamp.org ,2025)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? null : 'https://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Used to read cookies (Web Dev Cody ,2025)
app.use(cookieParser());

// Used to manage user session state
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_secure_default_key',
    resave: false,
    saveUninitialized: true,
    // Configuration for the session cookie
    cookie: { 
        httpOnly: true,
        secure: true, 
        maxAge: 3600000 // 1 hour
    }
}));

// This generates a CSRF token which is stored in the session and validates when a request is called. (Imran Codes ,2025)
const csrfProtection = csurf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Apply CSRF protection to all routes 
app.use(csrfProtection);

// Inform that the API is running
app.get('/', (req, res) => {
    res.send('API is running securely.');
});

// Creates a CSRF token (Imran Codes ,2025)
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Rate limiting to authentication routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/employees/login', authLimiter);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employees', employeeRoutes); 

// Debug logging 
console.log('Registered user routes:');
userRoutes.stack.forEach(layer => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
    console.log(`${methods.join(', ')} ${layer.route.path}`);
  }
}); 

console.log('Registered employee routes:');
employeeRoutes.stack.forEach(layer => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
    console.log(`${methods.join(', ')} ${layer.route.path}`);
  }
}); 

// CSRF error handling (Imran Codes ,2025)
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }
    // Handle CSRF token errors  (Imran Codes ,2025)
    console.error('CSRF Token Error on:', req.originalUrl);
    res.status(403).json({
        success: false,
        message: 'Invalid CSRF Token. Request rejected.'
    });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HTTP_PORT = 80; // Standard HTTP port

// Create HTTP app for redirects to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
});

// Start HTTP server for redirects (Orlov, 2020 & Mafia Codes ,2020)
http.createServer(httpApp).listen(HTTP_PORT, () => {
    console.log(`HTTP redirect running on port ${HTTP_PORT}`);
});

// Certificates for HTTPS (Orlov, 2020 & Mafia Codes ,2020)
const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('./localhost.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };
// Start the server with HTTPS (Orlov, 2020)
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
