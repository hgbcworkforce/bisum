# BISUM Conference - Technology Conference Management System

A modern, full-stack conference management system built with React and Supabase, designed for the BISUM Technology Conference. Features real-time registration tracking, integrated payment processing, and a comprehensive admin dashboard.

## 🎯 Overview

This project replaces traditional backend architecture with Supabase's Backend-as-a-Service, providing:
- **Real-time registration system** with live updates
- **Integrated payment processing** via Flutterwave
- **Admin dashboard** with analytics and data management
- **Responsive design** for all devices
- **Conference information** and speaker profiles

## 🚀 Features

### For Attendees
- **Registration**: Multi-step form with validation and real-time email checking
- **Payment Integration**: Secure payment processing with Flutterwave
- **Conference Information**: Speakers, schedule, and venue details
- **Registration Types**: Student, Professional, Speaker, and Sponsor options

### For Administrators
- **Real-time Dashboard**: Live registration and payment statistics
- **Attendee Management**: Search, view, and export attendee data
- **Payment Tracking**: Monitor transactions and payment status
- **Data Analytics**: Registration trends and revenue insights
- **Export Capabilities**: CSV exports for external analysis

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Payments**: Flutterwave API
- **Routing**: React Router
- **State Management**: React Hooks + Supabase Real-time
- **Deployment**: Netlify/Vercel ready

## 📁 Project Structure

```
bisum-conference/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin-specific components
│   │   │   ├── Navigation.jsx
│   │   │   ├── Hero.jsx
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── Homepage.jsx
│   │   │   ├── Registration.jsx
│   │   │   └── ...
│   │   ├── lib/                # Supabase functions
│   │   │   ├── supabase.js     # Client configuration
│   │   │   ├── attendees.js    # Attendee management
│   │   │   └── payments.js     # Payment processing
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom React hooks
│   │   └── data/               # Static data
│   ├── .env.example            # Environment variables template
│   └── package.json
├── supabase-setup/             # Database setup
│   └── database-schema.sql     # Complete PostgreSQL schema
├── migrate-to-supabase.js      # Migration and testing script
├── MIGRATION_GUIDE.md          # Detailed migration instructions
└── README.md                   # This file
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Flutterwave account (for payments)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd bisum-conference/client
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
```

### 3. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the SQL from `supabase-setup/database-schema.sql`
4. Update the admin email in the `admins` table

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- **`attendees`** - Conference registrations with personal info and preferences
- **`payments`** - Payment records linked to Flutterwave transactions  
- **`sessions`** - Conference sessions and workshops
- **`admins`** - Admin users for dashboard access

Key features:
- Automatic registration number generation
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Comprehensive indexing for performance

## 🔄 Real-time Features

The application includes real-time updates powered by Supabase:

```javascript
import { useAttendeesRealtime } from './hooks/useSupabaseRealtime';

// Subscribe to live registration updates
const { isConnected } = useAttendeesRealtime((payload) => {
  console.log('New registration:', payload);
});
```

- Live registration notifications on admin dashboard
- Real-time payment status updates
- Automatic statistics refresh
- WebSocket-based connections

## 💳 Payment Flow

1. User completes registration form
2. Registration saved to database with "pending" status
3. Payment initialized with Flutterwave
4. User redirected to Flutterwave payment page
5. After payment, user redirected to callback page
6. System verifies payment with Flutterwave
7. Registration status updated to "completed"
8. Admin receives real-time notification

## 🔐 Security

- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **Environment Variables**: Secure credential management
- **HTTPS Only**: Encrypted connections in production
- **API Key Rotation**: Support for key updates without downtime

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` with features including:

- **Real-time Statistics**: Live registration and payment counts
- **Attendee Management**: Search, filter, and view attendee details
- **Payment Analytics**: Revenue tracking and payment success rates
- **Data Export**: CSV exports for external analysis
- **System Health**: Connection status and error monitoring

## 🧪 Testing

Run the migration verification script to test your setup:

```bash
node migrate-to-supabase.js verify-setup
```

This will test:
- Supabase connection
- Database schema
- Sample data creation
- API functions

## 🚀 Deployment

### Netlify/Vercel
1. Connect your Git repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Add environment variables
5. Deploy

### Manual Deployment
```bash
cd client
npm run build
# Upload dist/ folder to your hosting provider
```

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Real-time Cleanup**: Automatic subscription management  
- **Optimized Queries**: Efficient database operations
- **Image Optimization**: Compressed speaker images
- **Code Splitting**: Reduced bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow React best practices
4. Use Tailwind CSS for styling
5. Test real-time features
6. Submit a pull request

## 🔧 Troubleshooting

### Environment Issues
- Ensure variables start with `VITE_`
- Restart dev server after env changes
- Check Supabase project URL format

### Database Issues  
- Verify RLS policies are set correctly
- Check if database schema was applied completely
- Ensure admin user exists in `admins` table

### Payment Issues
- Use test keys for development
- Check Flutterwave webhook configuration
- Monitor payment callback logs

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Flutterwave Developer Docs](https://developer.flutterwave.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or questions:
- Check the [Migration Guide](MIGRATION_GUIDE.md)
- Review the [troubleshooting section](#-troubleshooting)
- Create an issue in the repository

---

**BISUM Conference 2024** - Building Innovation through Technology