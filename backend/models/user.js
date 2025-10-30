import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, 
        },
        password: {
            type: String,
            required: true,
        },
        userNationalId: {
            type: String,
            required: true,
            unique: true, 
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true, 
        },
        balance: {
            type: Number,
            required: true,
            default: 0.00,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- Method: Compare entered password with hashed password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// If it exists, use the existing one; otherwise, compile and use the new one.
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
