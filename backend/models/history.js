import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',                           
        required: true
    },
    recipient: {
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
        enum: ['ZAR', 'USD', 'GBP', 'JPY'],
        default: 'ZAR'
    },
    originalAmount: { 
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: 'Payment transfer'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed'
    }
}, {
    timestamps: true
});
const History = mongoose.models.History || mongoose.model('History', historySchema);
export default History; 