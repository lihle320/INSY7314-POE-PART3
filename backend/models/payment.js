import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',                           
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['ZAR', 'USD', 'GBP', 'JPY'], // Available currencies
        required: true,
        default: 'ZAR'
    },
    recipientAccountNumber: {
        type: String,
        required: true
    },
    swiftCode: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    exchangeRate: {
        type: Number, // Store the exchange rate used for a transaction
        required: true
    },
    convertedAmount: {
        type: Number, // Amount in ZAR after conversion
        required: true
    }
}, {
    timestamps: true
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export { Payment };