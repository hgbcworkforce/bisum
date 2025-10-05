# Admin Authentication System Setup Guide

This guide explains how to set up the dual authentication system for the BISUM Conference platform:

1. **Admin System**: Authenticated committee members with dashboard access
2. **Public Registration**: Anonymous attendee registration (no accounts required)

## 🏗️ Architecture Overview

### Two Separate Systems:
- **Admins**: Use Supabase Auth + custom admin_users table with approval system
- **Attendees**: Direct database registration (no authentication required)

### Admin Permission Levels:
- **Super Admin**: Full access to everything
- **Admin**: Can manage most resources
- **Organizer**: Can view and basic management
- **Finance**: Payment-focused permissions

## 🚀 Setup Instructions

### Step 1: Database Setup

1. **Drop existing database** (if you have the old schema):
```sql
-- Run the database cleanup script from previous instructions
```

2. **Create new schema**:
```bash
# Run the new schema file in Supabase SQL Editor
database-schema-with-admin-auth.sql
```

### Step 2: Create First Admin User

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Click "Add User"** and create your first admin:
   - Email: `your-email@domain.com`  
   - Password: `your-secure-password`
   - Auto Confirm User: ✅ (check this)

3. **Get the User ID**:
   - After creating, click on the user
   - Copy the UUID (something like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. **Update admin_users table**:
```sql
-- Replace the placeholder in the database schema
UPDATE admin_users 
SET user_id = 'YOUR_COPIED_UUID_HERE'
WHERE email = 'admin@bisumconference.org';

-- Or insert a new record
INSERT INTO admin_users (
    user_id,
    email,
    full_name,
    role,
    is_active,
    is_approved,
    can_view_attendees,
    can_edit_attendees,
    can_view_payments,
    can_manage_payments,
    can_manage_sessions,
    can_manage_admins,
    department
) VALUES (
    'YOUR_COPIED_UUID_HERE',
    'your-email@domain.com',
    'Your Full Name',
    'super_admin',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    'Administration'
);
```

### Step 3: Update Frontend Routes

Add the admin authentication route to your app:

```javascript
// In your main App.jsx or router setup
import AdminAuth from './pages/admin/AdminAuth';

// Add route
<Route path="/admin/auth" element={<AdminAuth />} />
```

### Step 4: Test the System

1. **Test Public Registration**:
   - Go to `/registration`
   - Should work without any login
   - No authentication required

2. **Test Admin Login**:
   - Go to `/admin/auth`
   - Login with the admin credentials you created
   - Should redirect to dashboard after successful login

3. **Test Admin Registration**:
   - Go to `/admin/auth`
   - Click "Register for Admin Access"
   - New admins will be pending approval

## 🔐 Permission System

### Default Permissions by Role:

#### Super Admin (`super_admin`):
- ✅ All permissions enabled
- Can approve new admins
- Full system access

#### Admin (`admin`):
- ✅ View/Edit Attendees
- ✅ Manage Payments
- ✅ Manage Sessions  
- ❌ Manage Admins (cannot approve others)

#### Organizer (`organizer`) - Default for new signups:
- ✅ View Attendees
- ❌ Edit Attendees
- ✅ View Payments
- ❌ Manage Payments
- ❌ Manage Sessions
- ❌ Manage Admins

#### Finance (`finance`):
- ✅ View Attendees
- ❌ Edit Attendees  
- ✅ View Payments
- ✅ Manage Payments
- ❌ Manage Sessions
- ❌ Manage Admins

### Customizing Permissions:

```sql
-- Update permissions for a specific admin
UPDATE admin_users 
SET 
    can_edit_attendees = true,
    can_manage_payments = true
WHERE email = 'user@domain.com';
```

## 👥 Admin Approval Workflow

### New Admin Registration:
1. User visits `/admin/auth`
2. Fills registration form
3. Account created with `is_approved = false`
4. User sees "Pending Approval" message

### Admin Approval Process:
1. Existing admin logs in
2. Views pending admins in dashboard
3. Approves/rejects new accounts
4. Approved users can now login

### SQL for Manual Approval:
```sql
-- Approve a pending admin
UPDATE admin_users 
SET 
    is_approved = true,
    approved_by = (SELECT id FROM admin_users WHERE email = 'approver@domain.com'),
    approved_at = NOW()
WHERE email = 'newadmin@domain.com';
```

## 🛡️ Security Features

### Row Level Security (RLS):
- **Attendees**: Public can insert, admins can view/edit based on permissions
- **Payments**: Public can create, admins can view/manage based on permissions
- **Admin Users**: Self-access + management based on permissions
- **Activity Log**: Users see own activity, super admins see all

### Activity Logging:
All admin actions are logged in `admin_activity_log`:
- Login/logout events
- Data access and modifications
- Admin management actions

### Session Management:
- Supabase handles session tokens
- Auto-refresh for long sessions
- Secure logout with activity logging

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Permission Denied" on Registration:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'attendees';

-- Temporarily disable RLS for testing
ALTER TABLE attendees DISABLE ROW LEVEL SECURITY;
```

#### 2. Admin Can't Login:
```sql
-- Check admin user status
SELECT * FROM admin_users WHERE email = 'admin@domain.com';

-- Ensure user is active and approved
UPDATE admin_users 
SET is_active = true, is_approved = true 
WHERE email = 'admin@domain.com';
```

#### 3. Missing Permissions:
```sql
-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON attendees TO anon, authenticated;
GRANT SELECT, INSERT ON payments TO anon, authenticated;
```

### Debug Queries:

```sql
-- Check authentication status
SELECT auth.uid(), auth.jwt();

-- View admin permissions
SELECT 
    email, 
    role, 
    is_active, 
    is_approved,
    can_view_attendees,
    can_edit_attendees,
    can_manage_admins
FROM admin_users;

-- View recent activity
SELECT 
    au.email,
    aal.action,
    aal.created_at
FROM admin_activity_log aal
JOIN admin_users au ON aal.admin_id = au.id
ORDER BY aal.created_at DESC
LIMIT 10;
```

## 📱 Frontend Integration

### Admin Authentication Hook:
```javascript
// hooks/useAdminAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useAdminAuth = () => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: admin } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setAdminProfile(admin);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(checkAuth);
    return () => subscription.unsubscribe();
  }, []);

  return { user, adminProfile, loading };
};
```

### Protected Route Component:
```javascript
// components/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const ProtectedAdminRoute = ({ children, requiredPermission }) => {
  const { user, adminProfile, loading } = useAdminAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || !adminProfile) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (!adminProfile.is_approved || !adminProfile.is_active) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (requiredPermission && !adminProfile[requiredPermission]) {
    return <div>Access Denied - Insufficient Permissions</div>;
  }

  return children;
};

export default ProtectedAdminRoute;
```

## 🎯 Next Steps

1. **Test both systems** thoroughly
2. **Create admin approval interface** in dashboard
3. **Set up email notifications** for approvals
4. **Implement activity logging** in admin actions
5. **Create user management interface** for super admins

## ✅ Verification Checklist

- [ ] Public registration works without authentication
- [ ] Admin login works for approved users
- [ ] New admin signup creates pending account
- [ ] Permissions are enforced correctly
- [ ] Activity logging works
- [ ] RLS policies are secure
- [ ] Email notifications work (optional)

The system is now ready with proper separation between public registration and authenticated admin access!