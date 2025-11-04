import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Added import for User model
import Employee from '../models/employee.js'; 

// checks for a valid JWT in request header //(Web Dev Cody ,2025)
// This is the middleware for regular USERS
export const protect = async (req, res, next) => {
    console.log('protect middleware running');
    let token;

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        // Use return to stop execution and prevent calling next()
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
    }

    // Check if token exists in the Authorization header (Web Dev Cody ,2025)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (removes 'Bearer ' prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the REGULAR USER by ID from the token payload (excluding the password field)
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                // Token payload was valid, but user no longer exists in DB
                // Use return to stop execution and prevent calling next()
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach the user object to the request
            req.user = user; 
            
            next(); // Proceed to the next middleware or controller function

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            // Use return to stop execution (Web Dev Cody ,2025)
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // Use return to stop execution
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const protectEmployee = async (req, res, next) => {
     console.log(' protectEmployee running');
    let token;

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log('Employee Auth token:', decoded);

            // FIX: Use the correct ID field from your token
            const employeeId = decoded.id; // Your token uses 'id' not '_id'

            if (!employeeId) {
                return res.status(401).json({ message: 'Not authorized, invalid token payload' });
            }

            const employee = await Employee.findById(employeeId).select('-password');

            console.log('Employee Auth Found employee:', employee ? employee.employeeId : 'None');

            if (!employee) {
                return res.status(401).json({ message: 'Not authorized, employee not found' });
            }

            req.user = employee; 
            next();

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};