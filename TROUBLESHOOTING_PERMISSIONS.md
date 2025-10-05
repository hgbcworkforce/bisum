# BISUM Conference - Permission Error Troubleshooting Guide

## 🚨 "Permission denied. Please check your access rights." Error Fix

This guide helps you resolve the most common permission errors when registering for the BISUM Conference.

## 🔍 Root Cause Analysis

The permission error typically occurs due to one of these issues:

1. **Missing or incorrect environment variables**
2. **Supabase Row Level Security (RLS) policies blocking public registration**
3. **Database schema not properly configured**
4. **API keys not having the correct permissions**

## 🛠️ Step-by-Step Fix Guide

### Step 1: Check Environment Variables

First, ensure your environment variables are properly configured:

#### Create/Update `.env` file in the `client/` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Flutterwave Configuration
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here

# Application Settings
VITE_APP_URL=http://localhost:5173
```

**⚠️ Important Notes:**
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your_supabase_anon_key_here` with your actual Supabase anon key
- Replace `your_flutterwave_public_key_here` with your Flutterwave public key
- All variables must start with `VITE_` for Vite to recognize them
- No spaces around the `=` sign
- No quotes around the values

#### How to find your Supabase credentials:
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to **Settings** → **API**
5. Copy the **Project URL** (this is your `VITE_SUPABASE_URL`)
6. Copy the **anon/public** key (this is your `VITE_SUPABASE_ANON_KEY`)

### Step 2: Fix Database Permissions

The database needs to allow public users to register. Run this SQL in your Supabase SQL Editor:

```sql
-- Fix Row Level Security policies for public registration
-- Run this in your Supabase SQL Editor

-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow public registration" ON attendees;
DROP POLICY IF EXISTS "Allow public payment creation" ON payments;

-- 2. Create proper public registration policy
CREATE POLICY "Enable public registration" ON attendees
    FOR INSERT
    WITH CHECK (true);

-- 3. Allow public payment creation
CREATE POLICY "Enable public payment creation" ON payments
    FOR INSERT
    WITH CHECK (true);

-- 4. Grant necessary permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON attendees TO anon;
GRANT INSERT ON payments TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 5. Ensure RLS is properly configured
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 6. Test permissions
SELECT 
    CASE 
        WHEN has_table_privilege('anon', 'attendees', 'INSERT') THEN '✅ Attendees INSERT: ENABLED'
        ELSE '❌ Attendees INSERT: DISABLED'
    END as attendees_permission,
    CASE 
        WHEN has_table_privilege('anon', 'payments', 'INSERT') THEN '✅ Payments INSERT: ENABLED'
        ELSE '❌ Payments INSERT: DISABLED'
    END as payments_permission;
```

### Step 3: Verify API Key Permissions

In your Supabase dashboard:

1. Go to **Settings** → **API**
2. Make sure you're using the **anon/public** key (not the service role key)
3. Check that the key has the correct permissions:
   - Should allow INSERT on `attendees` table
   - Should allow INSERT on `payments` table

### Step 4: Test the Database Connection

Create a test file to verify your setup:

```bash
# In your terminal, from the client/ directory:
cd client
node -e "
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client created successfully');
console.log('URL:', supabaseUrl);
console.log('Key starts with:', supabaseAnonKey.substring(0, 10) + '...');
"
```

### Step 5: Restart Development Server

After making changes:

```bash
# Stop the development server (Ctrl+C)
# Then restart it:
cd client
npm run dev
```

## 🔧 Common Issues and Solutions

### Issue 1: "Missing Supabase environment variables"

**Symptoms:**
- Error: "Missing Supabase environment variables. Please check your .env file."

**Solution:**
1. Check that `.env` file exists in the `client/` directory
2. Verify all required variables are present
3. Restart the development server

### Issue 2: "Error 42501: insufficient_privilege"

**Symptoms:**
- Permission denied error when trying to register

**Solution:**
1. Run the SQL permissions fix (Step 2 above)
2. Make sure you're using the anon key, not the service role key

### Issue 3: "RLS policy violation"

**Symptoms:**
- "Policy violation" or "Row level security" errors

**Solution:**
```sql
-- Run this SQL to check current policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('attendees', 'payments');
```

If you see restrictive policies, drop them and recreate using Step 2.

### Issue 4: Email Already Registered

**Symptoms:**
- "This email is already registered for the conference"

**Solution:**
This is working correctly! Each email can only register once. Use a different email or contact admin to update existing registration.

## 🧪 Testing Registration

To test if the fix worked:

1. Open the registration page
2. Fill out the form with test data
3. Submit the form
4. You should see:
   - No permission errors
   - Either successful registration OR payment redirect
   - No "access denied" messages

## 📝 Environment Variable Template

Copy this template for your `.env` file:

```env
# Copy this template and replace with your actual values

# Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[your-actual-anon-key]

# Flutterwave Configuration (use test keys for development)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-[your-test-public-key]

# Application Settings
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development
```

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- Use **test keys** for Flutterwave during development
- The **anon key is safe to use in frontend** applications
- Keep your **service role key** secret and server-side only

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the browser console** (F12 → Console) for specific error messages
2. **Check Supabase logs** in your Supabase dashboard under Logs
3. **Verify your database schema** matches the provided SQL files
4. **Test with a fresh browser session** (clear cache/cookies)

## 🎯 Quick Diagnosis Checklist

- [ ] `.env` file exists in `client/` directory
- [ ] All environment variables are properly set
- [ ] Development server restarted after env changes
- [ ] SQL permissions fix has been applied
- [ ] Using the correct Supabase anon key
- [ ] No browser cache issues (try incognito mode)
- [ ] Database schema is up to date

## 💡 Prevention Tips

1. **Always use environment variables** for API keys
2. **Test database permissions** after schema changes  
3. **Keep Supabase dashboard open** to monitor real-time issues
4. **Use browser dev tools** to catch client-side errors early
5. **Regularly check Supabase logs** for backend issues

---

**Last Updated**: December 2024  
**Applies to**: BISUM Conference Registration System v2.0+