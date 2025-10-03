# BISUM Conference - Project Structure Documentation

This document provides a comprehensive overview of the project structure after migrating from MongoDB/Express to Supabase architecture.

## 📁 Root Directory Structure

```
bisum-conference/
├── client/                     # React frontend application
├── supabase-setup/            # Database setup and configuration
├── MIGRATION_GUIDE.md         # Detailed migration instructions
├── PROJECT_STRUCTURE.md       # This file
├── README.md                  # Main project documentation
├── SECURITY.md                # Security implementation guide
├── migrate-to-supabase.js     # Migration and testing script
└── package.json               # Root package.json with workspace scripts
```

## 🎨 Frontend Structure (`client/`)

```
client/
├── src/                       # Source code
│   ├── assets/               # Static assets (images, videos, etc.)
│   ├── components/           # Reusable UI components
│   │   ├── admin/           # Admin-specific components
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── RealtimeDashboard.jsx
│   │   ├── AboutSection.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Navigation.jsx
│   │   ├── ScheduleItem.jsx
│   │   ├── ScheduleList.jsx
│   │   ├── SpeakerCard.jsx
│   │   ├── SpeakerModal.jsx
│   │   ├── SpeakersSection.jsx
│   │   ├── Testimonials.jsx
│   │   └── index.js         # Component exports
│   ├── data/                # Static data and content
│   │   ├── speakersData.js  # Speaker information and utilities
│   │   └── README.md        # Data module documentation
│   ├── hooks/               # Custom React hooks
│   │   └── useSupabaseRealtime.js # Real-time functionality hooks
│   ├── lib/                 # Supabase functions and utilities
│   │   ├── supabase.js      # Supabase client configuration
│   │   ├── attendees.js     # Attendee management functions
│   │   └── payments.js      # Payment processing functions
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── AdminAttendees.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminPaymentSummary.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── Homepage.jsx     # Main landing page
│   │   ├── PaymentCallback.jsx # Payment verification page
│   │   ├── Registration.jsx # Registration form page
│   │   ├── Schedule.jsx     # Conference schedule
│   │   └── Speakers.jsx     # Speakers showcase
│   ├── services/            # API service layer
│   │   └── supabaseService.js # Main API service (replaces old Express API)
│   ├── App.css              # Global styles and animations
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Application entry point
├── public/                   # Public assets
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Frontend dependencies and scripts
├── README.md                # Frontend-specific documentation
└── vite.config.js           # Vite build configuration
```

## 🗄️ Database Setup (`supabase-setup/`)

```
supabase-setup/
└── database-schema.sql      # Complete PostgreSQL schema with:
                            # - Table definitions
                            # - Indexes and constraints
                            # - Row Level Security policies
                            # - Functions and triggers
                            # - Sample data
```

## 📋 Key Files and Their Purposes

### Configuration Files
- **`client/.env.example`** - Template for environment variables
- **`client/vite.config.js`** - Vite build tool configuration
- **`client/eslint.config.js`** - Code linting rules
- **`package.json`** - Root project configuration with workspace scripts

### Core Application Files
- **`client/src/App.jsx`** - Main React application component with routing
- **`client/src/main.jsx`** - Application entry point and providers setup
- **`client/src/App.css`** - Global styles and custom animations

### Supabase Integration
- **`lib/supabase.js`** - Supabase client setup and configuration
- **`lib/attendees.js`** - Complete attendee management (CRUD + real-time)
- **`lib/payments.js`** - Payment processing and Flutterwave integration
- **`services/supabaseService.js`** - API service layer providing compatibility with old Express API

### Real-time Features
- **`hooks/useSupabaseRealtime.js`** - Custom hooks for:
  - Live attendee updates
  - Real-time payment notifications
  - Dashboard statistics updates
  - Form management with validation

### Page Components
- **`pages/Homepage.jsx`** - Landing page with hero, speakers, countdown
- **`pages/Registration.jsx`** - Multi-step registration form with validation
- **`pages/PaymentCallback.jsx`** - Payment verification and success handling
- **`pages/admin/AdminDashboard.jsx`** - Real-time admin dashboard

### Utility Components
- **`components/Navigation.jsx`** - Responsive navigation with mobile menu
- **`components/CountdownTimer.jsx`** - Live countdown to conference date
- **`components/SpeakersSection.jsx`** - Dynamic speakers showcase
- **`components/admin/RealtimeDashboard.jsx`** - Live admin statistics

## 🔄 Data Flow Architecture

### Registration Flow
```
User Input → Validation → Supabase → Real-time Updates → Admin Dashboard
     ↓
Payment Init → Flutterwave → Callback → Verification → Status Update
```

### Real-time Updates Flow
```
Database Change → Supabase Real-time → React Hook → Component Update
```

### Admin Dashboard Flow
```
Supabase Queries → Data Aggregation → Real-time Subscriptions → Live UI Updates
```

## 🎯 Component Architecture

### Reusable Components
- **Navigation** - Responsive header with smooth scrolling
- **CountdownTimer** - Live countdown with automatic updates
- **SpeakerCard** - Speaker display with modal integration
- **Footer** - Site footer with contact information

### Page-Specific Components
- **Hero** - Landing page hero section with call-to-action
- **ScheduleItem/ScheduleList** - Conference schedule display
- **Testimonials** - Social proof and testimonials

### Admin Components
- **DashboardLayout** - Admin page layout wrapper
- **RealtimeDashboard** - Live statistics and notifications

## 📚 Data Models

### Attendees Table
```sql
attendees (
  id UUID PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  organization VARCHAR(100),
  registration_type ENUM,
  payment_status ENUM,
  created_at TIMESTAMPTZ,
  -- ... additional fields
)
```

### Payments Table
```sql
payments (
  id UUID PRIMARY KEY,
  attendee_id UUID REFERENCES attendees(id),
  transaction_ref VARCHAR(100) UNIQUE,
  amount DECIMAL(12,2),
  status ENUM,
  flutterwave_response JSONB,
  created_at TIMESTAMPTZ,
  -- ... additional fields
)
```

## 🛠️ Development Workflow

### Setup Commands
```bash
# Install all dependencies
npm run setup

# Start development server
npm run dev

# Test Supabase connection
npm run test-supabase

# Verify complete setup
npm run verify-setup
```

### File Organization Principles
1. **Components** - Single responsibility, reusable
2. **Pages** - Route-level components with data fetching
3. **Lib** - Pure functions, no React dependencies
4. **Services** - API abstraction layer
5. **Hooks** - Reusable stateful logic

## 🔒 Security Implementation

### Frontend Security
- Input validation and sanitization
- Environment variable management
- Secure API key handling
- HTTPS enforcement

### Database Security
- Row Level Security (RLS) policies
- Proper indexing for performance
- Data validation at database level
- Audit logging capabilities

## 📦 Dependencies

### Core Dependencies
- **React 19** - UI framework
- **@supabase/supabase-js** - Backend integration
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### Development Dependencies
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🚀 Deployment Structure

### Build Output
```
client/dist/
├── assets/          # Optimized assets with hashing
├── index.html       # Entry HTML file
└── ...             # Built application files
```

### Environment Configuration
- **Development** - Local development with hot reload
- **Production** - Optimized build with environment variables

---

**Note**: This structure reflects the cleaned-up project after migrating from MongoDB/Express to Supabase. All server-side components have been removed in favor of Supabase's Backend-as-a-Service architecture.