import jwt from 'jsonwebtoken';
// CORRECTED: Using the singular folder structure (model) and capitalized file (User.js)
import User from '../models/user.js'; 

// checks for a valid JWT in request header
const protect = async (req, res, next) => {
    let token;

    // CRITICAL: Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables!");
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
    }

    // Check if token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token using secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with the token ID (excluding the password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Use return to stop execution and prevent calling next()
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // goes to the next middleware or route handler

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            // Use return to stop execution
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // Use return to stop execution
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Use ES Module export syntax
export { protect };
