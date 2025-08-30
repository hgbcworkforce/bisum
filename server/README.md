# BISUM Conference Server

Backend API server for the BISUM Conference Website built with Node.js, Express.js, and MongoDB.

## Features

- **Attendee Registration**: Complete registration system with validation
- **Payment Integration**: Flutterwave payment processing with webhook support
- **Email Notifications**: Automated emails for registration and payment confirmations
- **Admin Dashboard**: Comprehensive admin panel for managing attendees and payments
- **RESTful API**: Clean, documented API endpoints
- **MongoDB Integration**: Mongoose ODM for data management
- **Security**: JWT authentication (placeholder), input validation, error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment**: Flutterwave SDK
- **Email**: Nodemailer
- **Authentication**: JWT (placeholder implementation)

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   ├── email.js      # Nodemailer configuration
│   └── flutterwave.js # Flutterwave SDK setup
├── controllers/      # Route controllers
│   ├── registrationController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   └── auth.js      # JWT authentication (placeholder)
├── models/          # Mongoose schemas
│   ├── Attendee.js
│   └── Payment.js
├── routes/          # API routes
│   ├── registrationRoutes.js
│   ├── paymentRoutes.js
│   └── adminRoutes.js
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
├── server.js        # Main application entry point
└── README.md        # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bisum-conference/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your configuration values:
     - MongoDB connection string
     - Flutterwave API keys
     - Email credentials
     - JWT secret

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will automatically create collections

## Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/bisum-conference

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_SECRET=your_secret_key
FLUTTERWAVE_SECRET_HASH=your_secret_hash
FLUTTERWAVE_REDIRECT_URL=http://localhost:3000/payment/callback

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the configured port (default: 5000).

## API Endpoints

### Registration Routes
- `POST /api/registration` - Register new attendee
- `GET /api/registration/:id` - Get attendee by ID
- `GET /api/registration/number/:number` - Get attendee by registration number
- `PUT /api/registration/:id` - Update attendee information
- `DELETE /api/registration/:id` - Cancel registration
- `GET /api/registration/stats` - Get registration statistics

### Payment Routes
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Flutterwave webhook handler
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments/stats` - Get payment statistics

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/attendees` - Get all attendees (paginated)
- `GET /api/admin/attendees/:id` - Get attendee details
- `PUT /api/admin/attendees/:id` - Update attendee (admin override)
- `GET /api/admin/attendees/export` - Export attendees data
- `GET /api/admin/payments` - Get all payments (paginated)

## Database Models

### Attendee Schema
- Personal information (name, email, phone)
- Organization details
- Registration type and preferences
- Payment status and references
- Timestamps and status tracking

### Payment Schema
- Transaction references
- Payment details and status
- Flutterwave integration data
- Attendee relationship
- Error handling and logging

## Security Features

- Input validation and sanitization
- Error handling middleware
- CORS configuration
- Rate limiting (to be implemented)
- JWT authentication (placeholder)

## Payment Flow

1. **Registration**: Attendee fills registration form
2. **Payment Initiation**: Payment is initialized via Flutterwave
3. **Payment Processing**: User completes payment on Flutterwave
4. **Webhook Verification**: Payment status verified via webhook
5. **Confirmation**: Email sent to attendee with confirmation

## Admin Features

- **Dashboard**: Real-time statistics and trends
- **Attendee Management**: View, search, filter, and export attendee data
- **Payment Tracking**: Monitor payment statuses and transactions
- **Data Export**: CSV export functionality for reporting

## Development Notes

### Authentication
- JWT authentication is currently a placeholder
- Implement proper admin authentication before production
- Add role-based access control

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Proper HTTP status codes

### Validation
- Input validation at multiple levels
- Mongoose schema validation
- API endpoint validation

## Production Considerations

1. **Environment Variables**: Secure all sensitive data
2. **Database**: Use production MongoDB instance
3. **SSL**: Enable HTTPS in production
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Implement database backup strategy
6. **Rate Limiting**: Enable rate limiting for API endpoints

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly

## License

MIT License - see LICENSE file for details

## Support

For technical support, contact the development team or create an issue in the repository.

