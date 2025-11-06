import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';

//Regex for Validation (Web Dev Simplified ,2019)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const onlyDigitsRegex = /^\d+$/; 

/**
 *  Registers a new user and creates a JWT token. (Web Dev Cody ,2025)
  
 */

//represents the user controller with functions to handle user registration, login, and profile retrieval (freeCodeCamp.org ,2025)
export const registerUser = async (req, res) => {
    const user = req.body;

    // Input Validation  (Web Dev Simplified ,2019
    if (!user.name || !user.password || !user.email || !user.userNationalId || !user.accountNumber) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (user.password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    if (user.userNationalId.toString().length !== 13 || !onlyDigitsRegex.test(user.userNationalId)) {
        return res.status(400).json({ message: 'National ID must be 13 digits and contain only numbers.' });
    }

    if (user.accountNumber.toString().length !== 10 || !onlyDigitsRegex.test(user.accountNumber)) {
        return res.status(400).json({ message: 'Account number must be 10 digits and contain only numbers.' });
    }
    
    if (!emailRegex.test(user.email)) {
        return res.status(400).json({ message: 'Invalid email address format.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: user.email });
    if (userExists) {
        return res.status(400).json({ message: 'User already registered with this email.' });
    }

    // Assign initial money 
    const newUser = new User ({ ...user, balance: 1000.00 });
    
    try{
        await newUser.save()
        const userResponse = newUser.toObject();
        delete userResponse.password; 

        const token = generateToken(newUser._id);

        res.status(201).json({ 
            message: 'Registration completed successfully', 
            user: userResponse,
            token,
            name: userResponse.name,
            _id: userResponse._id 
        });
    }
    catch(err){
        console.error("Error creating a user :", err); 
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Registration failed: Account number or email already in use.' });
        }
        return res.status(500).json({ message: 'Error saving user', error: err.message });
    }
};

/**
 Authenticates a user and creates a JWT token.
 
 */
export const loginUser = async (req, res) => {
    const { accountNumber, password } = req.body;

    const user = await User.findOne({ accountNumber });

    if (user && (await user.matchPassword(password))) {
        res.json({
            message: 'Login successful',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid account number or password' });
    }
};

/**
 *gets the users balance
 */
export const getUserBalance = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id).select('balance'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ 
            message: 'Balance retrieved successfully.', 
            balance: user.balance ? user.balance.toFixed(2) : '0.00' 
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Internal Server Error fetching balance.' });
    }
};

/**
 *gets user profile
 */
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Exclude password
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            userNationalId: user.userNationalId,
            accountNumber: user.accountNumber,
            balance: user.balance,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal Server Error fetching profile.' });
    }
};

export default {
    registerUser,
    loginUser,
    getUserBalance,
    getUserProfile
};