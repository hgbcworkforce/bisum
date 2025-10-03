# BISUM Conference Frontend

Modern React application for the BISUM Technology Conference built with React.js, Tailwind CSS, and powered by Supabase backend.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live registration and payment notifications
- **Component Architecture**: Modular, reusable components
- **Conference Registration**: Complete registration flow with validation
- **Payment Integration**: Flutterwave payment processing
- **Admin Dashboard**: Real-time analytics and data management
- **Real-time Countdown**: Live countdown to conference date

## Tech Stack

- **React 19** - Latest React with hooks
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Supabase** - Backend-as-a-Service (PostgreSQL + Real-time + Auth)
- **Flutterwave** - Payment processing
- **React Router** - Client-side routing

## Project Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── Navigation.jsx   # Header navigation
│   ├── Hero.jsx         # Hero section
│   ├── CountdownTimer.jsx  # Conference countdown
│   ├── SpeakersSection.jsx # Speakers showcase
│   └── index.js         # Component exports
├── pages/               # Page components
│   ├── admin/           # Admin dashboard pages
│   ├── Homepage.jsx     # Main homepage
│   ├── Registration.jsx # Registration form
│   ├── PaymentCallback.jsx # Payment verification
│   ├── Speakers.jsx     # Speakers page
│   └── Schedule.jsx     # Conference schedule
├── lib/                 # Supabase functions
│   ├── supabase.js      # Supabase client config
│   ├── attendees.js     # Attendee management
│   └── payments.js      # Payment processing
├── services/            # API services
│   └── supabaseService.js # Main API service
├── hooks/               # Custom React hooks
│   └── useSupabaseRealtime.js # Real-time hooks
├── data/                # Static data
│   └── speakersData.js  # Speaker information
├── App.jsx              # Main application
└── main.jsx             # Entry point
```

## Core Features

### Registration System
- Multi-step registration form with validation
- Real-time email duplicate checking
- Multiple registration types (Student, Professional, Speaker, Sponsor)
- Dietary restrictions and accessibility options

### Payment Processing
- Flutterwave integration for secure payments
- Real-time payment verification
- Payment status tracking and notifications
- Automatic registration number generation

### Admin Dashboard
- Real-time registration statistics
- Live payment monitoring
- Attendee management and search
- Data export capabilities (CSV)
- Payment analytics and reporting

### Real-time Updates
- Live registration notifications
- Real-time payment status updates
- Dashboard statistics that update automatically
- WebSocket connections via Supabase

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Flutterwave account (for payments)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   ```

3. **Database Setup**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the schema from `../supabase-setup/database-schema.sql`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_CONFERENCE_DATE` | Conference date | No |
| `VITE_STUDENT_PRICE` | Student registration price | No |
| `VITE_PROFESSIONAL_PRICE` | Professional registration price | No |

## API Integration

### Supabase Functions
- `attendees.js` - Complete attendee management
- `payments.js` - Payment processing and verification
- `supabaseService.js` - Main API service layer

### Real-time Features
```javascript
import { useAttendeesRealtime } from './hooks/useSupabaseRealtime';

// Subscribe to real-time attendee updates
const { isConnected } = useAttendeesRealtime((payload) => {
  console.log('New registration:', payload);
});
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Component Usage

### Registration Form
```javascript
import { useRegistrationForm } from './hooks/useSupabaseRealtime';

const MyComponent = () => {
  const {
    formData,
    errors,
    handleInputChange,
    validateForm
  } = useRegistrationForm();
  
  // Component implementation
};
```

### Real-time Dashboard
```javascript
import { useDashboardRealtime } from './hooks/useSupabaseRealtime';

const Dashboard = () => {
  const { stats, isConnected } = useDashboardRealtime((newStats) => {
    // Handle real-time updates
  });
};
```

## Payment Flow

1. User completes registration form
2. Registration is saved to Supabase with "pending" status
3. Payment is initialized with Flutterwave
4. User completes payment on Flutterwave
5. Payment callback verifies transaction
6. Registration status updates to "completed"
7. Real-time notifications sent to admin dashboard

## Admin Features

- **Dashboard**: Real-time statistics and recent registrations
- **Attendees Management**: View, search, and export attendee data
- **Payment Summary**: Payment analytics and transaction history
- **Settings**: Configuration and system settings

## Database Schema

The application uses PostgreSQL via Supabase with the following main tables:
- `attendees` - Conference registrations
- `payments` - Payment records
- `sessions` - Conference sessions
- `admins` - Admin users

## Security

- Row Level Security (RLS) enabled on all tables
- Input validation and sanitization
- Secure API key management
- HTTPS-only in production

## Performance Optimizations

- Lazy loading for components
- Real-time subscriptions cleanup
- Optimized database queries
- Image optimization for speakers
- Code splitting with Vite

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Netlify/Vercel
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Contributing

1. Follow React best practices
2. Use Tailwind CSS for styling
3. Ensure responsive design
4. Add proper error handling
5. Test real-time features
6. Update documentation

## Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure variables start with `VITE_`
- Restart development server after changes

**Supabase Connection Issues**
- Verify project URL and keys
- Check Row Level Security policies
- Ensure database schema is applied

**Payment Issues**
- Verify Flutterwave keys (test vs production)
- Check webhook URLs
- Monitor payment callback handling

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Flutterwave Docs**: [developer.flutterwave.com](https://developer.flutterwave.com)
- **React Docs**: [react.dev](https://react.dev)

## License

MIT License - see LICENSE file for details

---

**BISUM Conference 2024** - Building Innovation through Technology