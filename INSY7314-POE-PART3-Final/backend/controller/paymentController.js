import { Payment } from '../models/payment.js'; 
import User from '../models/user.js';
import History from '../models/history.js';
//represents the payment controller with functions to handle making payments and retrieving transaction history (freeCodeCamp.org ,2025)
export const makePayment = async (req, res) => {
    const { recipientAccountNumber, amount, currency, swiftCode, description } = req.body;
    const sender = req.user;

    // Input Validation
    if (!recipientAccountNumber || !amount || !currency || !swiftCode) {
        return res.status(400).json({ message: 'All fields are required.' });
        console.log('🔍 PAYMENT DEBUG - Currency:', currency, 'Type:', typeof currency);
        console.log('🔍 PAYMENT DEBUG - Should be pending?:', currency !== 'ZAR');
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

        // convert to rand
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
        
        // --- CORE APPROVAL LOGIC ---
        const requiresApproval = currency !== 'ZAR';
        const paymentStatus = requiresApproval ? 'pending' : 'Completed';
        
        // Define newBalance based on whether funds are deducted immediately
        let newBalance = senderUser.balance; 
        let responseMessage = '';

        if (!requiresApproval) {
            // Process payment in rands - ONLY if it's ZAR (domestic)
            await User.updateOne({ _id: senderUser._id }, { $inc: { balance: -amountInZAR } });
            await User.updateOne({ _id: recipient._id }, { $inc: { balance: amountInZAR } });
            newBalance = senderUser.balance - amountInZAR;
            responseMessage = 'Local ZAR payment processed successfully.';
        } else {
            // For international payments, set status to pending and DO NOT transfer funds yet.
            responseMessage = `International payment in ${currency} requires employee approval. Status set to PENDING. No funds have been deducted.`;
        }

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
            status: paymentStatus // Use the determined status
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
    status: paymentStatus // Use the determined status
    });

        await historyRecord.save();

        //saves the new balance after payment. newBalance is either updated or same as before transaction.
        return res.status(200).json({
            message: responseMessage, // Use dynamic response message
            status: paymentStatus, // Include the status in the response
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
                status: paymentStatus, // Use the determined status
                exchangeRate: exchangeRate
            }
            
        });
        

    } catch (error) {
        console.error("Payment error:", error);
        return res.status(500).json({ message: 'Internal Server Error during payment processing.' });
    }
};
/**
 gets history of transactions for the authenticated user
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

        // Format the output for the frontend 
        const formattedHistory = history.map(txn => {
            const isSender = txn.sender._id.toString() === req.user._id.toString();

            const type = isSender ? 'Debit (Sent)' : 'Credit (Received)';
                //return the relevant transaction details
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
