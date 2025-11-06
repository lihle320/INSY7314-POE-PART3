import mongoose from 'mongoose';

// Define the Employee Schema
const employeeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true, // Employees should still have a unique login/email
        },
        password: { 
            type: String,
            required: true,
        },
        employeeId: { // Renamed from userNationalId for clarity
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true, // Keep timestamps for created and updated records
    }
);

/**
 * Custom method to compare the entered password with the stored password.
 * NOTE: Since your requirements specify that passwords are not hashed, 
 * this performs a raw string comparison.
 */
employeeSchema.methods.matchPassword = async function (enteredPassword) {
    return enteredPassword === this.password; 
};


const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// FIX: Export the Employee model using named export for robust importing.
export default Employee;
