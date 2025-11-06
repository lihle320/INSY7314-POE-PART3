import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
//represents the user model with fields for name, email, password, national ID, account number, and balance (freeCodeCamp.org ,2025)
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
//hashes the password before saving (Studying With Alex ,2021)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    //(Studying With Alex ,2021)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password (Studying With Alex ,2021)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;