import express from 'express';
import { makePayment, getTransactionHistory } from '../controller/paymentController.js'; 
import { protect } from '../authentication/auth.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`Payment route method: ${req.method} ${req.originalUrl}`);
    next();
});

router.post('/pay', protect, makePayment);
router.get('/history', protect, getTransactionHistory);

router.get('/test', (req, res) => {
    console.log('/api/payments/test route working');
    res.json({ message: 'Payment routes are working!' });
});

export default router;