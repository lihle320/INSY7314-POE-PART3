# GlobePay

GlobePay is a comprehensive web application designed to facilitate seamless, secure, and rapid international payments. This application empowers users to manage their transactions effectively, access detailed payment histories, and send international remittances with ease and confidence.

## Features

### User Registration and Authentication
- Secure user registration with comprehensive validation
- JWT-based authentication system
- Protected routes and session management

### Dashboard with Transaction Overview
- Real-time transaction history display
- Summary cards showing total amounts sent and received
- Transaction categorization (sent/received)
- Status tracking for all payments
- Currency conversion display

### International Payments
- Multi-currency support (ZAR, USD, GBP, JPY)
- Real-time currency conversion
- SWIFT code validation
- Secure payment processing
- Transaction notifications

### Responsive Design
- Modern, mobile-friendly interface
- Clean and intuitive user experience
- Accessible on all device sizes

### Enhanced Security
- Comprehensive input validation and sanitization
- Password strength evaluation
- Secure token-based authentication
- Data encryption and protection

## Frontend Components

### Dashboard
- Displays transaction history with sorting (newest first)
- Summary cards for quick financial overview
- Transaction table with detailed information
- Real-time balance updates
- Error handling and loading states

### Authentication
- **Login**: Account number and password authentication
- **Register**: Comprehensive user registration with:
  - Full name validation
  - 13-digit National ID verification
  - 10-digit account number validation
  - Email format validation
  - Password strength meter
  - Confirm password matching

### Payment Processing
- International payment form with:
  - Recipient account validation (10 digits)
  - SWIFT code validation (8-11 characters)
  - Currency selection (ZAR, USD, GBP, JPY)
  - Amount validation
  - Optional description field
- Real-time error handling
- Success confirmation

### User Profile
- Personal information display
- Current balance
- Account details
- Secure profile management

## Backend Architecture

### API Endpoints

#### User Endpoints
- **POST /api/users/register** - User registration
- **POST /api/users/login** - User authentication
- **GET /api/users/profile** - Get user profile
- **GET /api/users/balance** - Get current balance

#### Payment Endpoints
- **POST /api/payments/pay** - Process international payments
- **GET /api/payments/history** - Retrieve transaction history

### Security Implementation

#### Authentication & Authorization
- JWT token-based authentication
- Protected routes middleware
- Token expiration handling
- Automatic token refresh

#### Input Validation
```javascript
const regex = {
    fullName: /^[A-Za-z]+(?:\s[A-Za-z]+)+$/,
    idNumber: /^\d{13}$/,
    accountNumber: /^\d{10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    swiftCode: /^[A-Z0-9]{8,11}$/,
    amount: /^\d+(\.\d{1,2})?$/
};
```

#### Payment Security
- Balance verification before transactions
- Currency conversion rate validation
- Duplicate transaction prevention
- SWIFT code format validation

### Database Models

#### User Model
- Personal information storage
- Secure password hashing (bcrypt)
- Account balance management
- Unique constraints (email, national ID, account number)

#### Payment Model
- Transaction recording
- Currency conversion tracking
- Status monitoring
- Audit trail

#### History Model
- Comprehensive transaction history
- Sender/recipient tracking
- Amount and currency details
- Timestamp recording

### Payment Processing Logic

#### Currency Conversion
```javascript
const exchangeRates = {
    ZAR: 1,
    USD: 18.5,
    GBP: 23.0,
    JPY: 0.12
};
```

#### Transaction Flow
1. Input validation and sanitization
2. Recipient account verification
3. Sufficient balance check
4. Currency conversion calculation
5. Balance updates (sender and recipient)
6. Transaction record creation
7. History entry generation
8. Success response with details

## Security Measures

### Comprehensive Security Implementation
- **Data Encryption**: All sensitive data encrypted using bcrypt hashing and industry-standard algorithms
- **JWT Authentication**: Secure token-based authentication with short expiration times
- **Input Sanitization**: Comprehensive validation and sanitization to prevent injection attacks
- **CORS Protection**: Properly configured Cross-Origin Resource Sharing policies
- **Rate Limiting**: API rate limiting to prevent brute force attacks
- **Session Management**: Secure session handling with proper timeout mechanisms
- **HTTPS Enforcement**: All communications forced over secure HTTPS protocol
- **Password Security**: Strong password requirements with strength evaluation

### Validation & Error Handling
- Frontend and backend validation consistency
- Meaningful error messages
- Graceful error recovery
- Input sanitization against XSS and injection attacks

## Getting Started

### Prerequisites
- **Node.js** (v14 or later)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/globepay.git
   cd globepay
   ```

2. **Install Dependencies**
    **Important**: Due to dependency compatibility requirements, you must use the `--force` flag during installation.
   
   **Frontend Installation:**
   ```bash
   cd ./frontend
   npm install --force
   ```
   
   **Backend Installation:**
   ```bash
   cd ./backend
   npm install --force
   ```

3. **Environment Configuration**
   Create `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   ENCRYPTION_KEY=your_encryption_key
   ```

4. **Start the Application**
   **Backend:**
   ```bash
   cd ./backend
   npm start
   ```
   
   **Frontend (new terminal):**
   ```bash
   cd ./frontend
   npm start
   ```

### Usage Instructions

1. **Registration**
   - Navigate to registration page
   - Fill in required personal information
   - Create strong password
   - Complete account setup

2. **Login**
   - Use account number and password
   - Secure JWT authentication
   - Automatic redirect to dashboard

3. **Dashboard**
   - View transaction summary
   - Monitor account balance
   - Access payment history

4. **Making Payments**
   - Navigate to payments section
   - Enter recipient details
   - Select currency and amount
   - Confirm transaction


## Technologies Used

### Frontend
- **React** - User interface framework
- **CSS3** - Styling and responsive design
- **Axios** - HTTP client for API calls
- **React Router** - Navigation and routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database storage
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Security
- **JWT Tokens** - Secure authentication
- **Input Validation** - Comprehensive data sanitization
- **CORS** - Cross-origin resource sharing protection
- **Helmet.js** - Security headers

## API Documentation

### Authentication Headers
Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation and FAQs

---

**GlobePay** - Secure International Payments Made Simple
