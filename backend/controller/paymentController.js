import { Payment } from '../models/payment.js'; 
import User from '../models/user.js';
import History from '../models/history.js';

export const makePayment = async (req, res) => {
    const { recipientAccountNumber, amount, currency, swiftCode, description } = req.body;
    const sender = req.user;

    // Input Validation
    if (!recipientAccountNumber || !amount || !currency || !swiftCode) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Invalid payment amount.' });
    }
    
    if (recipientAccountNumber.toString().length !== 10) {
        return res.status(400).json({ message: 'Recipient account number must be 10 digits.' });
    }

    // Validate currency
    const validCurrencies = ['ZAR', 'USD', 'GBP', 'JPY'];
    if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ message: 'Invalid currency.' });
    }

    // Validate SWIFT code (8-11 characters)
    if (swiftCode.length < 8 || swiftCode.length > 11) {
        return res.status(400).json({ message: 'SWIFT code must be 8-11 characters.' });
    }

    try {
        const [senderUser, recipient] = await Promise.all([
            User.findById(sender._id), 
            User.findOne({ accountNumber: recipientAccountNumber })
        ]);

        if (!recipient) {
            return res.status(404).json({ message: 'Payment failed: Invalid recipient account number.' });
        }
        
        if (senderUser.accountNumber === recipientAccountNumber) {
            return res.status(400).json({ message: 'Cannot make a payment to your own account.' });
        }

        // cnvert to rand
        const exchangeRates = {
            ZAR: 1,
            USD: 18.5,    
            GBP: 23.0,      
            JPY: 0.12     
        };

        const exchangeRate = exchangeRates[currency];
        const amountInZAR = parsedAmount * exchangeRate;

        // Check balance in rand equivalent
        if (senderUser.balance < amountInZAR) {
            return res.status(400).json({ 
                message: `Insufficient funds. You need ${amountInZAR.toFixed(2)} ZAR for this transaction.` 
            });
        }

        // Process payment in ZAR
        await User.updateOne({ _id: senderUser._id }, { $inc: { balance: -amountInZAR } });
        await User.updateOne({ _id: recipient._id }, { $inc: { balance: amountInZAR } });

        // Generate unique transaction ID
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        // Create Payment recordS
        const paymentRecord = new Payment({
            userId: senderUser._id,
            amount: parsedAmount,
            currency: currency,
            recipientAccountNumber: recipientAccountNumber,
            swiftCode: swiftCode,
            transactionId: transactionId,
            exchangeRate: exchangeRate,
            convertedAmount: amountInZAR,
            status: 'completed'
        });

        await paymentRecord.save();

        // Create History record
    const historyRecord = new History({
    sender: senderUser._id,
    recipient: recipient._id,
    amount: amountInZAR, 
    currency: currency,  
    originalAmount: parsedAmount,
    description: description || `${currency} International transfer`,
    status: 'Completed'
    });

        await historyRecord.save();

        const newBalance = senderUser.balance - amountInZAR;

        return res.status(200).json({
            message: 'International payment processed successfully.',
            newBalance: newBalance.toFixed(2),
            exchangeRate: exchangeRate,
            originalAmount: parsedAmount.toFixed(2),
            originalCurrency: currency,
            convertedAmount: amountInZAR.toFixed(2),
            convertedCurrency: 'ZAR',
            swiftCode: swiftCode,
            history: {
                id: historyRecord._id,
                fromUser: senderUser.name,
                toUser: recipient.name,
                amount: parsedAmount.toFixed(2),
                currency: currency,
                convertedAmount: amountInZAR.toFixed(2),
                accountNumber: recipientAccountNumber,
                swiftCode: swiftCode,
                status: 'Completed',
                exchangeRate: exchangeRate
            }
            
        });
        

    } catch (error) {
        console.error("International payment error:", error);
        return res.status(500).json({ message: 'Internal Server Error during payment processing.' });
    }
};
/**
 * @desc Get the authenticated user's transaction history.
 * @route GET /api/payments/history
 * @access Private
 */
export const getTransactionHistory = async (req, res) => {
    try {
        const history = await History.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(50) 
        .populate('sender', 'name accountNumber')
        .populate('recipient', 'name accountNumber');

        // Format the output for the frontend consumption
        const formattedHistory = history.map(txn => {
            const isSender = txn.sender._id.toString() === req.user._id.toString();

            const type = isSender ? 'Debit (Sent)' : 'Credit (Received)';

            return {
                id: txn._id,
                date: txn.createdAt,
                type: type, 
                amount: txn.amount,
                description: txn.description,
                counterparty: isSender ? txn.recipient.name : txn.sender.name,
                counterpartyAccount: isSender ? txn.recipient.accountNumber : txn.sender.accountNumber,
                status: txn.status
            };
        });

        res.status(200).json({
            message: 'Transaction history retrieved successfully',
            count: formattedHistory.length,
            history: formattedHistory
        });

    } catch (error) {
        console.error('Error retrieving transaction history:', error);
        res.status(500).json({ message: 'Internal Server Error retrieving history.' });
    }
};
