# Registration Form Changes

This document outlines the changes made to the registration form and database schema based on your requirements.

## Changes Made

### 1. Removed Fields
- **Professional Information Section**: Completely removed
  - `organization` field (previously required)
  - `position` field (optional)

### 2. Updated Session Preferences
- **Old**: "Session Preferences" with multiple checkbox selections
- **New**: "Breakout Session Choices" with single radio button selection
- **Options**:
  - Investment
  - Tech
  - Fashion
  - Agriculture
  - Foods
- **Requirement**: Now mandatory (required field)

### 3. Replaced Additional Information Fields
- **Removed**:
  - "Special Accessibility Needs" (optional textarea)
  - "Dietary Restrictions or Allergies" (optional textarea)
- **Added**:
  - "What are your expectations?" (optional textarea, 500 character limit)

### 4. Added New Required Field
- **"How did you know about this conference?"** (required radio buttons)
- **Options**:
  - Church
  - Instagram
  - Recommendation from friend
  - Whatsapp
  - Facebook
  - Flyer

## Database Schema Changes

### New Database Fields
```sql
-- New enum types
CREATE TYPE referral_source AS ENUM ('church', 'instagram', 'recommendation_from_friend', 'whatsapp', 'facebook', 'flyer');
CREATE TYPE breakout_session_choice AS ENUM ('investment', 'tech', 'fashion', 'agriculture', 'foods');

-- New columns in attendees table
expectations TEXT,                                    -- Optional
referral_source referral_source NOT NULL,           -- Required
breakout_session_choice breakout_session_choice NOT NULL -- Required
```

### Removed Database Fields
```sql
-- These fields have been removed
organization VARCHAR(100) NOT NULL,
position VARCHAR(100),
dietary_restrictions TEXT,
special_needs TEXT,
session_preferences TEXT[] DEFAULT '{}'
```

## Required vs Optional Fields

### Required Fields (all must be filled)
- First Name
- Last Name
- Email Address
- Phone Number
- Registration Type
- **How did you know about this conference?** *(new)*
- **Breakout Session Choice** *(new)*

### Optional Fields
- **What are your expectations?** *(new)*

## Migration Instructions

### For New Installations
1. Use the updated `database-schema.sql` file
2. No additional migration needed

### For Existing Databases
1. **IMPORTANT**: Back up your database before running migrations
2. Run the migration file: `supabase-setup/migration-registration-fields.sql`
3. This will:
   - Add new enum types
   - Add new columns
   - Set default values for existing records
   - Remove old columns
   - Update the attendee_summary view
   - Update indexes

### Migration Command
```bash
# In Supabase SQL Editor, run:
-- First ensure you have the base schema
\i database-schema.sql

-- Then run the migration
\i migration-registration-fields.sql
```

## Files Updated

### Frontend Files
- `client/src/pages/Registration.jsx` - Main registration form
- `client/src/services/supabaseService.js` - API service functions
- `client/src/hooks/useSupabaseRealtime.js` - Form validation hooks
- `client/src/lib/attendees.js` - Attendee management functions
- `client/src/lib/payments.js` - Payment-related queries

### Database Files
- `supabase-setup/database-schema.sql` - Updated main schema
- `supabase-setup/migration-registration-fields.sql` - Migration for existing databases

## Validation Rules

### Frontend Validation
```javascript
// Required field validation
if (!formData.referralSource) {
  errors.referralSource = "Please select how you heard about this conference";
}

if (!formData.breakoutSessionChoice) {
  errors.breakoutSessionChoice = "Please select a breakout session choice";
}

// Optional field validation
if (formData.expectations && formData.expectations.length > 500) {
  errors.expectations = "Expectations cannot exceed 500 characters";
}
```

### Database Constraints
```sql
-- New fields are required at database level
referral_source referral_source NOT NULL,
breakout_session_choice breakout_session_choice NOT NULL
```

## UI/UX Changes

### Form Layout
1. **Personal Information** section remains unchanged
2. **Professional Information** section completely removed
3. **How did you know about this conference?** section added (required)
4. **Registration Type** section remains unchanged
5. **Breakout Session Choices** replaces Session Preferences (required, single choice)
6. **Additional Information** simplified to just expectations (optional)

### Visual Changes
- Radio buttons instead of checkboxes for session selection
- Cleaner, more focused form with fewer fields
- Better mobile responsiveness maintained
- Consistent validation styling

## Testing Checklist

Before deploying to production:

- [ ] Test registration with all required fields filled
- [ ] Test validation for missing required fields
- [ ] Test character limits on expectations field
- [ ] Test all referral source options
- [ ] Test all breakout session choices
- [ ] Verify database records are created correctly
- [ ] Test admin dashboard displays new fields properly
- [ ] Test CSV export includes new fields and excludes old ones
- [ ] Test payment flow still works correctly

## Rollback Plan

If you need to rollback:

1. **Database Rollback**:
```sql
-- Add back old columns (modify as needed)
ALTER TABLE attendees ADD COLUMN organization VARCHAR(100);
ALTER TABLE attendees ADD COLUMN position VARCHAR(100);
ALTER TABLE attendees ADD COLUMN dietary_restrictions TEXT;
ALTER TABLE attendees ADD COLUMN special_needs TEXT;
ALTER TABLE attendees ADD COLUMN session_preferences TEXT[] DEFAULT '{}';

-- Remove new columns
ALTER TABLE attendees DROP COLUMN expectations;
ALTER TABLE attendees DROP COLUMN referral_source;
ALTER TABLE attendees DROP COLUMN breakout_session_choice;
```

2. **Code Rollback**: Revert the frontend files to their previous versions

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the Supabase dashboard for database errors
3. Verify all migration steps were completed successfully
4. Ensure environment variables are correctly set

The form is now streamlined and focuses on the essential information needed for conference registration while gathering valuable insights about attendee expectations and referral sources.