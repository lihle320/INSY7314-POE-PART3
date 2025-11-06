import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Payment } from '../models/payment.js';
import User from '../models/user.js';
import History from '../models/history.js';
import Employee from '../models/employee.js';

const employeeGenerateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
    
    res.cookie('jwt_employee', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

export const employeeLogin = async (req, res) => {
    const { employeeId, password } = req.body;

    console.log('Login attempt for employeeId:', employeeId);

    try {
        const employee = await Employee.findOne({ employeeId });
        console.log('Found employee:', employee ? employee.employeeId : 'None');

        if (employee) {
            console.log('Checking password...');
            const isPasswordValid = password === employee.password;
            console.log('Password valid:', isPasswordValid);
            
            if (isPasswordValid) {
                const token = jwt.sign(
                    { 
                        id: employee._id,
                        employeeId: employee.employeeId,
                        role: 'employee' 
                    }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '30d' }
                );

                console.log('Login successful for:', employee.employeeId);

                res.json({
                    success: true,
                    employee: {
                        _id: employee._id,
                        name: employee.name,
                        email: employee.email,
                        employeeId: employee.employeeId,
                    },
                    token: token
                });
                return;
            }
        }

        console.log('Login failed - invalid credentials');
        res.status(401).json({ 
            success: false,
            message: 'Invalid employee ID or password' 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error during login.' 
        });
    }
};

const updateStatusAndTransfer = async (paymentId, status, amountInZAR, senderId, recipientAccountNumber) => {
    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { status: status },
        { new: true }
    );

    if (!updatedPayment) {
        throw new Error('Payment record not found.');
    }

    const recipient = await User.findOne({ accountNumber: recipientAccountNumber });

    if (!recipient) {
        throw new Error('Recipient user not found during approval/rejection process.');
    }

    const updatedHistory = await History.findOneAndUpdate(
        { 
            sender: senderId, 
            recipient: recipient._id, 
            originalAmount: updatedPayment.amount, 
            status: 'pending' 
        },
        { status: status },
        { new: true }
    );
    
    if (!updatedHistory) {
        console.warn(`No matching pending history record found for paymentId: ${paymentId}`);
    }

    if (status === 'completed') {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await User.updateOne({ _id: senderId }, { $inc: { balance: -amountInZAR } }, { session });
            await User.updateOne({ _id: recipient._id }, { $inc: { balance: amountInZAR } }, { session });
            await session.commitTransaction();
            return 'Funds transferred successfully.';
        } catch (txnError) {
            await session.abortTransaction();
            console.error("Transaction failed during fund transfer:", txnError);
            throw new Error('Fund transfer failed due to database transaction error. Reverting changes.');
        } finally {
            session.endSession();
        }
    }
    
    return `Transaction status updated to ${status}. No fund transfer executed.`;
};

export const debugAllPayments = async (req, res) => {
    try {
        const allPayments = await Payment.find({})
            .populate('userId', 'name accountNumber email')
            .sort({ createdAt: -1 });

        console.log('🔍 DEBUG - All payments in database:', allPayments.length);

        const formatted = allPayments.map(p => ({
            id: p._id,
            transactionId: p.transactionId,
            sender: p.userId?.name || 'Unknown',
            senderAccount: p.userId?.accountNumber || 'N/A',
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            recipientAccount: p.recipientAccountNumber,
            swiftCode: p.swiftCode,
            createdAt: p.createdAt,
            isInternational: p.currency !== 'ZAR'
        }));

        res.json({
            total: allPayments.length,
            payments: formatted,
            stats: {
                pending: allPayments.filter(p => p.status === 'pending').length,
                completed: allPayments.filter(p => p.status === 'completed').length,
                international: allPayments.filter(p => p.currency !== 'ZAR').length,
                pendingInternational: allPayments.filter(p => p.status === 'pending' && p.currency !== 'ZAR').length,
                byCurrency: {
                    ZAR: allPayments.filter(p => p.currency === 'ZAR').length,
                    USD: allPayments.filter(p => p.currency === 'USD').length,
                    GBP: allPayments.filter(p => p.currency === 'GBP').length,
                    JPY: allPayments.filter(p => p.currency === 'JPY').length
                }
            }
        });
    } catch (error) {
        console.error('Debug payments error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllTransactions = async (req, res) => {
    try {
        const allPayments = await Payment.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name accountNumber email');

        const formattedPayments = allPayments.map(p => ({
            id: p._id,
            transactionId: p.transactionId,
            senderName: p.userId ? p.userId.name : 'Unknown User',
            senderAccount: p.userId ? p.userId.accountNumber : 'N/A',
            originalAmount: p.amount,
            currency: p.currency,
            exchangeRate: p.exchangeRate,
            convertedAmountZAR: p.convertedAmount.toFixed(2),
            recipientAccount: p.recipientAccountNumber,
            swiftCode: p.swiftCode,
            date: p.createdAt,
            status: p.status
        }));

        res.status(200).json({
            count: formattedPayments.length,
            transactions: formattedPayments,
            message: 'All transactions retrieved successfully.'
        });
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Internal Server Error retrieving transactions.' });
    }
};

export const seedInitialEmployees = async (req, res) => {
    try {
        const dummyEmployees = [
            { name: 'Alice Smith', email: 'alice.s@bank.com', password: 'securePass1', employeeId: 'EID001' },
            { name: 'Bob Johnson', email: 'bob.j@bank.com', password: 'securePass2', employeeId: 'EID002' },
            { name: 'Charlie Brown', email: 'charlie.b@bank.com', password: 'securePass3', employeeId: 'EID003' },
            { name: 'Diana Prince', email: 'diana.p@bank.com', password: 'securePass4', employeeId: 'EID004' },
            { name: 'Edward Stark', email: 'edward.s@bank.com', password: 'securePass5', employeeId: 'EID005' },
            { name: 'Fiona Glenanne', email: 'fiona.g@bank.com', password: 'securePass6', employeeId: 'EID006' },
            { name: 'George Costanza', email: 'george.c@bank.com', password: 'securePass7', employeeId: 'EID007' },
            { name: 'Hannah Montana', email: 'hannah.m@bank.com', password: 'securePass8', employeeId: 'EID008' },
            { name: 'Irene Adler', email: 'irene.a@bank.com', password: 'securePass9', employeeId: 'EID009' },
            { name: 'Jack Reacher', email: 'jack.r@bank.com', password: 'securePass10', employeeId: 'EID010' },
        ];
        
        await Employee.deleteMany({}); 
        const createdEmployees = await Employee.insertMany(dummyEmployees);

        if (res) {
            return res.status(201).json({ 
                message: `${createdEmployees.length} employees seeded successfully.`,
                employees: createdEmployees.map(e => ({ name: e.name, email: e.email, employeeId: e.employeeId, password: e.password }))
            });
        } else {
            console.log(`${createdEmployees.length} employees seeded successfully.`);
        }
    } catch (error) {
        console.error('Error seeding employees:', error);
        if (res) {
            return res.status(500).json({ message: 'Internal Server Error during employee seeding.' });
        }
    }
};

export const getEmployeeProfile = async (req, res) => {
    try {
        const employee = await Employee.findById(req.user._id).select('-password'); 

        if (employee) {
            res.status(200).json({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                employeeId: employee.employeeId,
                createdAt: employee.createdAt,
            });
        } else {
            res.status(404).json({ message: 'Employee profile not found.' });
        }
    } catch (error) {
        console.error('Error fetching employee profile:', error);
        res.status(500).json({ message: 'Internal Server Error fetching profile.' });
    }
};

export const getPendingTransactions = async (req, res) => {
    try {
        const pendingPayments = await Payment.find({ status: 'pending' })
            .sort({ createdAt: 1 })
            .populate('userId', 'name accountNumber email');

        const formattedPayments = pendingPayments.map(p => ({
            id: p._id,
            transactionId: p.transactionId,
            senderName: p.userId ? p.userId.name : 'Unknown User',
            senderAccount: p.userId ? p.userId.accountNumber : 'N/A',
            originalAmount: p.amount,
            currency: p.currency,
            exchangeRate: p.exchangeRate,
            convertedAmountZAR: p.convertedAmount.toFixed(2),
            recipientAccount: p.recipientAccountNumber,
            swiftCode: p.swiftCode,
            date: p.createdAt,
            status: p.status
        }));

        res.status(200).json({
            count: formattedPayments.length,
            transactions: formattedPayments,
            message: 'Pending transactions retrieved successfully.'
        });
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ message: 'Internal Server Error retrieving pending transactions.' });
    }
};

export const approveTransaction = async (req, res) => {
    const { id: paymentId } = req.params;

    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        
        if (payment.status !== 'pending') {
            return res.status(400).json({ message: `Transaction already processed with status: ${payment.status}.` });
        }

        const message = await updateStatusAndTransfer(
            paymentId, 
            'completed', 
            payment.convertedAmount, 
            payment.userId, 
            payment.recipientAccountNumber
        );

        res.status(200).json({ 
            message: `Transaction ${payment.transactionId} approved successfully. Funds have been transferred.`,
            transactionId: payment.transactionId,
            newStatus: 'completed'
        });
        
    } catch (error) {
        console.error('Error approving transaction:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error during approval process.' });
    }
};

export const rejectTransaction = async (req, res) => {
    const { id: paymentId } = req.params;

    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        
        if (payment.status !== 'pending') {
            return res.status(400).json({ message: `Transaction already processed with status: ${payment.status}.` });
        }
        
        await updateStatusAndTransfer(
            paymentId, 
            'rejected', 
            0,
            payment.userId, 
            payment.recipientAccountNumber
        );

        res.status(200).json({ 
            message: `Transaction ${payment.transactionId} rejected successfully. Funds remain in sender's account.`,
            transactionId: payment.transactionId,
            newStatus: 'rejected'
        });

    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error during rejection process.' });
    }
};

export default {
    employeeLogin,
    getEmployeeProfile, 
    getPendingTransactions,
    approveTransaction, 
    rejectTransaction,
    seedInitialEmployees,
    debugAllPayments,
    getAllTransactions
};