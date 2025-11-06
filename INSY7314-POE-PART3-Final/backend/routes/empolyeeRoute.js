import express from 'express';
import { protect, protectEmployee } from '../authentication/auth.js';
import { 
    getEmployeeProfile,
    getPendingTransactions,
    approveTransaction,
    rejectTransaction,
    seedInitialEmployees,
    employeeLogin,
    debugAllPayments,
    getAllTransactions
} from '../controller/employeeController.js';

const router = express.Router();

router.route('/seed').post(seedInitialEmployees);

// Protected Employee Routes
router.post('/login', employeeLogin);
router.route('/profile').get(protectEmployee, getEmployeeProfile);
router.route('/transactions/pending').get(protectEmployee, getPendingTransactions);
router.route('/transactions/approve/:id').put(protectEmployee, approveTransaction);
router.route('/transactions/reject/:id').put(protectEmployee, rejectTransaction);
router.get('/debug-payments', protectEmployee, debugAllPayments);
router.get('/transactions/all', protectEmployee, getAllTransactions); // ✅ Fixed: .get() not .put()

// ❌ REMOVE THIS DUPLICATE LINE:
// router.get('/transactions/pending', getPendingTransactions);

router.get('/debug-auth', protect, protectEmployee, (req, res) => {
    console.log('User from token:', req.user);
    res.json({ 
        message: 'Auth successful',
        user: req.user 
    });
});

export default router;