# Migration Guide: MongoDB to Supabase for BISUM Conference

This guide will help you migrate your BISUM Conference project from MongoDB/Express backend to Supabase.

## Overview

**Benefits of switching to Supabase:**
- ✅ Built-in admin dashboard for managing registrations
- ✅ Real-time updates and notifications
- ✅ Automatic API generation (no need for custom CRUD endpoints)
- ✅ Better security with Row Level Security (RLS)
- ✅ PostgreSQL performance and reliability
- ✅ Built-in authentication system
- ✅ File storage capabilities
- ✅ Simplified architecture

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Flutterwave Account**: For payment processing
3. **Node.js**: Version 18 or higher

## Step 1: Set up Supabase Project

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `bisum-conference`
   - Set a strong database password
   - Choose a region (preferably close to Nigeria)

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy the Project URL and anon public key

## Step 2: Database Setup

1. **Run the database schema**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the content from `supabase-setup/database-schema.sql`
   - Click "Run" to execute the schema

2. **Update admin email**:
   ```sql
   UPDATE admins SET email = 'your-admin-email@domain.com' WHERE role = 'super_admin';
   ```

## Step 3: Environment Configuration

1. **Create `.env` file in the client directory**:
   ```bash
   cp client/.env.example client/.env
   ```

2. **Update environment variables**:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
   ```

## Step 4: Data Migration (Optional)

If you have existing data in MongoDB, you can migrate it:

### Export from MongoDB

1. **Export attendees**:
   ```bash
   mongoexport --db bisum_conference --collection attendees --out attendees.json --pretty
   ```

2. **Export payments**:
   ```bash
   mongoexport --db bisum_conference --collection payments --out payments.json --pretty
   ```

### Import to Supabase

Create a migration script or use the Supabase dashboard to import your data. You'll need to map the MongoDB fields to the PostgreSQL schema:

**MongoDB → Supabase Field Mapping**:

```javascript
// Attendees mapping
{
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  phone: 'phone',
  organization: 'organization',
  position: 'position',
  registrationNumber: 'registration_number',
  registrationType: 'registration_type',
  registrationDate: 'registration_date',
  paymentStatus: 'payment_status',
  dietaryRestrictions: 'dietary_restrictions',
  specialNeeds: 'special_needs',
  sessionPreferences: 'session_preferences',
  status: 'status'
}

// Payments mapping
{
  transactionRef: 'transaction_ref',
  flutterwaveTransactionId: 'flutterwave_transaction_id',
  attendeeId: 'attendee_id',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  paymentMethod: 'payment_method',
  paymentChannel: 'payment_channel',
  flutterwaveResponse: 'flutterwave_response',
  initiatedAt: 'initiated_at',
  paidAt: 'paid_at',
  metadata: 'metadata',
  errorMessage: 'error_message',
  errorCode: 'error_code'
}
```

## Step 5: Frontend Integration

1. **Install Supabase client**:
   ```bash
   cd client
   npm install @supabase/supabase-js
   ```

2. **Update your React components** to use the new Supabase functions instead of API calls:

   **Before (MongoDB/Express API)**:
   ```javascript
   // Old approach
   const response = await fetch('/api/registration', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(attendeeData)
   });
   ```

   **After (Supabase)**:
   ```javascript
   // New approach
   import { createAttendee } from '../lib/attendees.js';
   
   const result = await createAttendee(attendeeData);
   if (result.success) {
     // Handle success
   }
   ```

## Step 6: Replace API Endpoints

Replace your existing API calls with Supabase functions:

### Registration
```javascript
// Replace /api/registration POST
import { createAttendee, checkEmailExists } from '../lib/attendees.js';

// Replace /api/registration GET
import { getAttendees, getAttendeeById } from '../lib/attendees.js';
```

### Payments
```javascript
// Replace /api/payments/*
import { 
  createPayment, 
  getPaymentById, 
  markPaymentAsSuccessful 
} from '../lib/payments.js';
```

### Admin Dashboard
```javascript
// Replace /api/admin/*
import { 
  getRegistrationStats, 
  getPaymentStats,
  exportAttendeesToCSV 
} from '../lib/attendees.js';
```

## Step 7: Authentication Setup (Optional)

Set up Supabase Auth for admin login:

1. **Enable email authentication** in Supabase Dashboard → Authentication → Settings
2. **Add admin users** to the `admins` table
3. **Use Supabase Auth** in your admin components:

```javascript
import { supabase } from '../lib/supabase.js';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@bisum.org',
  password: 'your-password'
});

// Check if user is admin
const { data: admin } = await supabase
  .from('admins')
  .select('*')
  .eq('email', user.email)
  .single();
```

## Step 8: Real-time Features

Add real-time updates to your dashboard:

```javascript
import { subscribeToAttendees } from '../lib/attendees.js';

// Subscribe to attendee changes
const subscription = subscribeToAttendees((payload) => {
  console.log('New registration:', payload);
  // Update your UI
});

// Cleanup subscription
return () => subscription.unsubscribe();
```

## Step 9: Payment Webhook Update

Update your payment webhook to work with Supabase:

```javascript
// In your webhook handler
import { processFlutterwaveWebhook } from '../lib/payments.js';

export default async function handler(req, res) {
  const result = await processFlutterwaveWebhook(req.body);
  
  if (result.success) {
    res.status(200).json({ status: 'success' });
  } else {
    res.status(400).json({ error: result.error });
  }
}
```

## Step 10: Testing

1. **Test registration flow**:
   - Fill out registration form
   - Verify data appears in Supabase dashboard
   - Test payment integration

2. **Test admin dashboard**:
   - View attendee list
   - Export data
   - Check real-time updates

3. **Test payment processing**:
   - Make test payments
   - Verify webhook processing
   - Check payment status updates

## Step 11: Deployment

1. **Update environment variables** in your production environment
2. **Set up Supabase edge functions** if you need server-side processing
3. **Configure Flutterwave** production keys
4. **Set up database backups** in Supabase

## Benefits After Migration

### For Administrators:
- **Built-in Dashboard**: Use Supabase's admin interface to view and manage data
- **Real-time Analytics**: See registrations as they happen
- **Data Export**: Easy CSV exports for analysis
- **Better Security**: Row-level security and audit logs

### For Developers:
- **Less Backend Code**: No need for Express.js routes and controllers
- **Automatic API**: Supabase generates REST and GraphQL APIs
- **Real-time Updates**: Built-in websocket support
- **Better Performance**: PostgreSQL is more performant than MongoDB for this use case

### For Users:
- **Faster Responses**: Optimized queries and caching
- **Better Reliability**: Enterprise-grade infrastructure
- **Real-time Updates**: Live registration counts and updates

## Troubleshooting

### Common Issues:

1. **RLS Policies**: If you can't access data, check your Row Level Security policies
2. **Environment Variables**: Make sure all VITE_ prefixed variables are set correctly
3. **CORS Issues**: Configure allowed origins in Supabase settings
4. **Payment Webhooks**: Update Flutterwave webhook URL to point to your new endpoint

### Getting Help:

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: Join the community for support
- **GitHub Issues**: Create issues in your repository for team discussion

## Rollback Plan

If you need to rollback:

1. Keep your existing MongoDB/Express code in a separate branch
2. Export data from Supabase before major changes
3. Test thoroughly in a staging environment first

## Next Steps

After migration:

1. **Optimize queries** using Supabase's query optimization tools
2. **Set up monitoring** and alerts
3. **Configure backups** and point-in-time recovery
4. **Explore advanced features** like Edge Functions and Storage

---

## Summary

This migration will significantly simplify your architecture while providing better performance, security, and developer experience. The built-in admin dashboard alone will save you hours of development time.

**Estimated migration time**: 1-2 days for a small to medium project like BISUM Conference.

**Key advantages**: Better dashboard, real-time features, less code to maintain, and enterprise-grade reliability.