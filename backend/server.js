dotenv.config();
import express from 'express';
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js'; 
import userRoutes from './routes/userRoute.js';
import paymentRoutes from './routes/paymentRoute.js'; // Assuming this exists


const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// 2. Global Error Handler
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// Connect to the database
connectDB(); 

const app = express();

app.use(helmet()); 

app.use(express.json());

// CORS setup to allow requests from your frontend
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

//routes
app.use('/api/users', userRoutes); 
app.use('/api/payments', paymentRoutes);
// --- Error Middleware Chain (Must be placed AFTER all routes) ---
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
//certificates
const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
    // You can optionally add a line to redirect HTTP to HTTPS later if needed
});
/*
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port http://localhost:${PORT}`);
});

*/
