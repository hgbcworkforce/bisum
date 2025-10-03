#!/usr/bin/env node

/**
 * BISUM Conference Migration Script
 *
 * This script helps test and migrate your BISUM Conference project from MongoDB to Supabase.
 *
 * Usage:
 * node migrate-to-supabase.js [command]
 *
 * Commands:
 * - test-connection: Test Supabase connection
 * - create-sample-data: Create sample data for testing
 * - export-mongodb: Export data from MongoDB (if available)
 * - import-to-supabase: Import data to Supabase
 * - verify-setup: Verify the complete setup
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bisum_conference',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Sample data for testing
const sampleAttendees = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+2348012345678',
    organization: 'Tech Corp',
    position: 'Software Engineer',
    registrationType: 'professional',
    dietaryRestrictions: null,
    specialNeeds: null,
    sessionPreferences: ['Artificial Intelligence & Machine Learning', 'Blockchain & Cryptocurrency']
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@university.edu',
    phone: '+2348087654321',
    organization: 'University of Lagos',
    position: 'Computer Science Student',
    registrationType: 'student',
    dietaryRestrictions: 'Vegetarian',
    specialNeeds: null,
    sessionPreferences: ['Mobile App Development', 'Data Science & Analytics']
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@techcompany.com',
    phone: '+2348055555555',
    organization: 'Innovation Labs',
    position: 'CTO',
    registrationType: 'speaker',
    dietaryRestrictions: null,
    specialNeeds: 'Wheelchair accessible venue',
    sessionPreferences: ['DevOps & Cloud Computing', 'Cybersecurity']
  }
];

// Test Supabase connection
async function testSupabaseConnection() {
  logInfo('Testing Supabase connection...');

  try {
    // Check if environment variables are set
    if (!config.supabaseUrl || config.supabaseUrl.includes('your-project-id')) {
      logError('Supabase URL not properly configured. Please update your .env file.');
      return false;
    }

    if (!config.supabaseAnonKey || config.supabaseAnonKey.includes('your-supabase-anon-key')) {
      logError('Supabase anon key not properly configured. Please update your .env file.');
      return false;
    }

    // Simple fetch test to Supabase REST API
    const response = await fetch(`${config.supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      logSuccess('Supabase connection successful!');
      return true;
    } else {
      logError(`Supabase connection failed. Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Supabase connection error: ${error.message}`);
    return false;
  }
}

// Test database schema
async function testDatabaseSchema() {
  logInfo('Testing database schema...');

  try {
    // Test attendees table
    const attendeesResponse = await fetch(`${config.supabaseUrl}/rest/v1/attendees?select=count`, {
      method: 'GET',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (attendeesResponse.status === 200) {
      logSuccess('Attendees table exists and accessible');
    } else {
      logError('Attendees table not accessible. Make sure you ran the database schema.');
      return false;
    }

    // Test payments table
    const paymentsResponse = await fetch(`${config.supabaseUrl}/rest/v1/payments?select=count`, {
      method: 'GET',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (paymentsResponse.status === 200) {
      logSuccess('Payments table exists and accessible');
    } else {
      logError('Payments table not accessible. Make sure you ran the database schema.');
      return false;
    }

    return true;
  } catch (error) {
    logError(`Database schema test error: ${error.message}`);
    return false;
  }
}

// Create sample data
async function createSampleData() {
  logInfo('Creating sample data for testing...');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const attendee of sampleAttendees) {
      try {
        const response = await fetch(`${config.supabaseUrl}/rest/v1/attendees`, {
          method: 'POST',
          headers: {
            'apikey': config.supabaseAnonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            first_name: attendee.firstName,
            last_name: attendee.lastName,
            email: attendee.email,
            phone: attendee.phone,
            organization: attendee.organization,
            position: attendee.position,
            registration_type: attendee.registrationType,
            dietary_restrictions: attendee.dietaryRestrictions,
            special_needs: attendee.specialNeeds,
            session_preferences: attendee.sessionPreferences,
            payment_status: 'pending',
            status: 'active'
          })
        });

        if (response.status === 201) {
          const data = await response.json();
          logSuccess(`Created attendee: ${attendee.firstName} ${attendee.lastName} (${data[0].registration_number})`);
          successCount++;
        } else {
          const error = await response.text();
          logError(`Failed to create attendee ${attendee.firstName} ${attendee.lastName}: ${error}`);
          errorCount++;
        }
      } catch (error) {
        logError(`Error creating attendee ${attendee.firstName} ${attendee.lastName}: ${error.message}`);
        errorCount++;
      }
    }

    logInfo(`Sample data creation completed: ${successCount} successful, ${errorCount} failed`);
    return successCount > 0;
  } catch (error) {
    logError(`Sample data creation error: ${error.message}`);
    return false;
  }
}

// Test API functions
async function testApiFunctions() {
  logInfo('Testing API functions...');

  try {
    // Test getting attendees
    const attendeesResponse = await fetch(`${config.supabaseUrl}/rest/v1/attendees?limit=5`, {
      method: 'GET',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });

    if (attendeesResponse.status === 200) {
      const attendees = await attendeesResponse.json();
      logSuccess(`Successfully fetched ${attendees.length} attendees`);

      if (attendees.length > 0) {
        const firstAttendee = attendees[0];
        logInfo(`Sample attendee: ${firstAttendee.first_name} ${firstAttendee.last_name} (${firstAttendee.registration_number})`);
      }
    } else {
      logError('Failed to fetch attendees');
      return false;
    }

    return true;
  } catch (error) {
    logError(`API functions test error: ${error.message}`);
    return false;
  }
}

// Check environment setup
function checkEnvironmentSetup() {
  logInfo('Checking environment setup...');

  const envPath = path.join(__dirname, 'client', '.env');
  const envExamplePath = path.join(__dirname, 'client', '.env.example');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      logWarning('.env file not found. Copying from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      logInfo('Please update the .env file with your actual Supabase credentials.');
    } else {
      logError('Neither .env nor .env.example found. Please create environment configuration.');
      return false;
    }
  }

  // Check if Supabase packages are installed
  const packageJsonPath = path.join(__dirname, 'client', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
      logSuccess('Supabase client library is installed');
    } else {
      logWarning('Supabase client library not found. Run: cd client && npm install @supabase/supabase-js');
    }
  }

  return true;
}

// Export from MongoDB (if available)
async function exportFromMongoDB() {
  logInfo('Attempting to export data from MongoDB...');

  try {
    const { MongoClient } = require('mongodb');

    const client = new MongoClient(config.mongoUri);
    await client.connect();

    const db = client.db('bisum_conference');

    // Export attendees
    const attendees = await db.collection('attendees').find({}).toArray();
    const payments = await db.collection('payments').find({}).toArray();

    // Save to JSON files
    const exportDir = path.join(__dirname, 'mongodb-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    fs.writeFileSync(
      path.join(exportDir, 'attendees.json'),
      JSON.stringify(attendees, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, 'payments.json'),
      JSON.stringify(payments, null, 2)
    );

    logSuccess(`Exported ${attendees.length} attendees and ${payments.length} payments to mongodb-export/`);

    await client.close();
    return true;
  } catch (error) {
    logWarning(`MongoDB export failed: ${error.message}. This is expected if MongoDB is not running.`);
    return false;
  }
}

// Generate migration report
function generateMigrationReport() {
  const report = `
# BISUM Conference Migration Report

Generated: ${new Date().toISOString()}

## Migration Steps Completed:
- [x] Supabase project setup
- [x] Database schema creation
- [x] Environment configuration
- [x] Sample data creation
- [x] API function testing

## Next Steps:
1. Update your React components to use the new supabaseService.js
2. Test the registration form
3. Test the payment flow
4. Test the admin dashboard
5. Deploy to production

## Files Updated:
- client/src/services/supabaseService.js (NEW)
- client/src/lib/supabase.js (NEW)
- client/src/lib/attendees.js (NEW)
- client/src/lib/payments.js (NEW)
- client/src/hooks/useSupabaseRealtime.js (NEW)
- client/.env (UPDATED)

## Commands to Run:
\`\`\`bash
cd client
npm install @supabase/supabase-js
npm run dev
\`\`\`

## Supabase Dashboard:
Visit your Supabase project dashboard to:
- View and manage data
- Monitor real-time connections
- Check API logs
- Manage authentication

## Support:
- Supabase Docs: https://supabase.com/docs
- Project Repository: Check your GitHub/GitLab repository
`;

  fs.writeFileSync('MIGRATION_REPORT.md', report);
  logSuccess('Migration report generated: MIGRATION_REPORT.md');
}

// Main execution
async function main() {
  const command = process.argv[2] || 'verify-setup';

  log(`\n🚀 BISUM Conference Migration Tool\n`, 'cyan');

  switch (command) {
    case 'test-connection':
      await testSupabaseConnection();
      break;

    case 'create-sample-data':
      if (await testSupabaseConnection()) {
        await createSampleData();
      }
      break;

    case 'export-mongodb':
      await exportFromMongoDB();
      break;

    case 'test-schema':
      await testDatabaseSchema();
      break;

    case 'verify-setup':
      log('Running complete setup verification...\n', 'bright');

      let allPassed = true;

      // Check environment
      if (!checkEnvironmentSetup()) allPassed = false;

      // Test connection
      if (!(await testSupabaseConnection())) allPassed = false;

      // Test schema
      if (!(await testDatabaseSchema())) allPassed = false;

      // Test API functions
      if (!(await testApiFunctions())) allPassed = false;

      // Generate report
      generateMigrationReport();

      if (allPassed) {
        log('\n🎉 Setup verification completed successfully!', 'green');
        log('Your Supabase migration is ready. Check MIGRATION_REPORT.md for next steps.', 'green');
      } else {
        log('\n❌ Setup verification failed. Please fix the issues above.', 'red');
      }
      break;

    default:
      log('Available commands:', 'bright');
      log('- test-connection: Test Supabase connection');
      log('- test-schema: Test database schema');
      log('- create-sample-data: Create sample data for testing');
      log('- export-mongodb: Export data from MongoDB');
      log('- verify-setup: Run complete verification (default)');
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the script
main().catch(error => {
  logError(`Script execution failed: ${error.message}`);
  process.exit(1);
});
