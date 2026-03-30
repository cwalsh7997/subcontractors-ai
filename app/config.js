/**
 * Subcontractors.ai Dashboard Configuration
 *
 * This file contains all configuration for the dashboard application.
 * Set your Supabase credentials and app settings here.
 *
 * GETTING STARTED:
 * 1. Create a free Supabase project at https://supabase.com
 * 2. Go to Project Settings > API to find your credentials
 * 3. Paste your SUPABASE_URL and SUPABASE_ANON_KEY below
 * 4. Set demoMode to false when Supabase is configured
 */

// =============================================================================
// SUPABASE CONFIGURATION
// =============================================================================
//
// Get these values from: https://supabase.com/dashboard/project/_/settings/api
//
// SUPABASE_URL: Your project's REST API URL
// Example: https://xyzabc.supabase.co
//
// SUPABASE_ANON_KEY: Your project's anonymous public API key
// Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//

window.SUPABASE_URL = 'https://ljpsfhhcbjvkkuvdpjip.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcHNmaGhjYmp2a2t1dmRwamlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTU2MjUsImV4cCI6MjA5MDM3MTYyNX0.oDelqqGDbvrfvkD0XsxTiJ9F2IppQPlPunAgcjpCH_o';
window.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcHNmaGhjYmp2a2t1dmRwamlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTU2MjUsImV4cCI6MjA5MDM3MTYyNX0.oDelqqGDbvrfvkD0XsxTiJ9F2IppQPlPunAgcjpCH_o';

// =============================================================================
// ADMIN CONFIGURATION
// =============================================================================

// List of email addresses that have admin access
// Admins can view user management, all payments, and analytics
// Add your email here to grant admin access to yourself
window.ADMIN_EMAILS = [
  'connor@acglass.com'
];

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

window.APP_CONFIG = {
  // Application name
  siteName: 'Subcontractors.ai',

  // Application version
  version: '0.1.0',

  // Support email (shown in error messages and footer)
  supportEmail: 'hello@subcontractors.ai',

  // Support phone
  supportPhone: '+1 (866) 000-0000',

  // Support URL
  supportUrl: 'https://subcontractors.ai/support',

  // Documentation URL
  docsUrl: 'https://docs.subcontractors.ai',

  // Demo mode: when true, app uses localStorage instead of Supabase
  // Set to false after configuring Supabase
  // In demo mode, all data is stored locally and lost on browser clear
  demoMode: false,

  // Session timeout in minutes (0 = no timeout)
  sessionTimeout: 0,

  // Default currency
  currency: 'USD',

  // Default timezone
  timezone: 'America/Chicago',

  // Pagination
  itemsPerPage: 25,

  // Feature flags
  features: {
    payments: true,
    projects: true,
    compliance: true,
    gcRatings: true,
    aiTools: true,
    analytics: true
  }
};

// =============================================================================
// SUPABASE DATABASE SCHEMA
// =============================================================================
//
// When you set up Supabase, you'll need to create these tables:
//
// 1. TABLE: profiles
//    - id (UUID, primary key)
//    - email (text)
//    - name (text)
//    - company (text)
//    - phone (text)
//    - avatar_url (text)
//    - subscription_status (text) - 'free', 'trial', 'active', 'cancelled'
//    - subscription_plan (text) - 'starter', 'pro', 'enterprise'
//    - created_at (timestamp)
//    - updated_at (timestamp)
//
// 2. TABLE: payments
//    - id (UUID, primary key)
//    - user_id (UUID, foreign key to profiles)
//    - project_id (UUID, optional)
//    - amount (numeric)
//    - due_date (date)
//    - paid_date (date, nullable)
//    - status (text) - 'pending', 'paid', 'overdue'
//    - notes (text)
//    - created_at (timestamp)
//    - updated_at (timestamp)
//
// 3. TABLE: projects
//    - id (UUID, primary key)
//    - user_id (UUID, foreign key to profiles)
//    - name (text)
//    - description (text)
//    - status (text) - 'active', 'completed', 'on_hold'
//    - start_date (date)
//    - end_date (date)
//    - total_value (numeric)
//    - created_at (timestamp)
//    - updated_at (timestamp)
//
// SQL to create these tables:
//
// CREATE TABLE profiles (
//   id UUID PRIMARY KEY DEFAULT auth.uid(),
//   email TEXT UNIQUE NOT NULL,
//   name TEXT,
//   company TEXT,
//   phone TEXT,
//   avatar_url TEXT,
//   subscription_status TEXT DEFAULT 'free',
//   subscription_plan TEXT DEFAULT 'starter',
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// CREATE TABLE payments (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
//   project_id UUID,
//   amount NUMERIC NOT NULL,
//   due_date DATE NOT NULL,
//   paid_date DATE,
//   status TEXT DEFAULT 'pending',
//   notes TEXT,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// CREATE TABLE projects (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
//   name TEXT NOT NULL,
//   description TEXT,
//   status TEXT DEFAULT 'active',
//   start_date DATE,
//   end_date DATE,
//   total_value NUMERIC,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// CREATE INDEX idx_payments_user_id ON payments(user_id);
// CREATE INDEX idx_payments_due_date ON payments(due_date);
// CREATE INDEX idx_projects_user_id ON projects(user_id);

// =============================================================================
// ENVIRONMENT-SPECIFIC SETTINGS
// =============================================================================

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = isLocalhost || window.location.hostname.includes('dev');
const isProduction = window.location.hostname.includes('subcontractors.ai');

// Development overrides
if (isDevelopment) {
  window.APP_CONFIG.features.analytics = true;
  // Uncomment to test demo mode locally:
  // window.APP_CONFIG.demoMode = true;
}

// Production overrides
if (isProduction) {
  window.APP_CONFIG.demoMode = false;
}

// =============================================================================
// API ENDPOINTS
// =============================================================================

window.API_ENDPOINTS = {
  // Webhook endpoints for payment processing
  webhooks: {
    stripe: '/api/webhooks/stripe',
    paypal: '/api/webhooks/paypal'
  },

  // Analytics endpoints
  analytics: {
    track: '/api/analytics/track',
    event: '/api/analytics/event'
  },

  // Export endpoints
  export: {
    payments: '/api/export/payments',
    projects: '/api/export/projects',
    report: '/api/export/report'
  }
};

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

window.NOTIFICATION_SETTINGS = {
  // Payment reminders
  paymentReminders: {
    enabled: true,
    daysBeforeDue: 7,
    frequency: 'weekly'
  },

  // Email notifications
  emailNotifications: {
    paymentReminders: true,
    paymentConfirmations: true,
    weeklySummary: true,
    accountUpdates: true
  },

  // In-app notifications
  inAppNotifications: {
    paymentDue: true,
    paymentOverdue: true,
    projectUpdates: true
  }
};

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

window.THEME_CONFIG = {
  // Primary colors matching marketing site
  colors: {
    navy: '#0f1729',
    blue: '#2563eb',
    orange: '#f59e0b',
    green: '#16a34a',
    red: '#dc2626'
  },

  // Font settings
  fonts: {
    primary: '"Inter", system-ui, sans-serif',
    mono: '"Monaco", "Menlo", monospace'
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};

// =============================================================================
// SECURITY SETTINGS
// =============================================================================

window.SECURITY_CONFIG = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Session security
  session: {
    // Require HTTPS (recommended for production)
    requireHttps: isProduction,

    // Secure cookies
    secureCookies: isProduction,

    // SameSite cookie setting
    sameSite: 'Strict'
  },

  // API security
  api: {
    // Enable CORS (adjust as needed)
    corsEnabled: true,

    // API rate limits (requests per minute)
    rateLimit: 100,

    // Request timeout in seconds
    timeout: 30
  }
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

// Export settings for reports and data downloads
window.EXPORT_CONFIG = {
  // Supported export formats
  formats: ['csv', 'json', 'pdf'],

  // Include in exports
  include: {
    payments: {
      amount: true,
      dueDate: true,
      paidDate: true,
      status: true,
      notes: true
    },
    projects: {
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      totalValue: true
    }
  }
};

// =============================================================================
// LOGGING CONFIGURATION
// =============================================================================

window.LOG_CONFIG = {
  // Log level: 'debug', 'info', 'warn', 'error'
  level: isDevelopment ? 'debug' : 'warn',

  // Console logging enabled
  console: isDevelopment,

  // Remote logging enabled (if you have a log aggregation service)
  remote: isProduction,

  // Remote logging endpoint
  remoteEndpoint: 'https://api.subcontractors.ai/logs'
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

window.VALIDATION_RULES = {
  payment: {
    amountMin: 0.01,
    amountMax: 999999.99,
    notesMaxLength: 500
  },

  project: {
    nameMinLength: 3,
    nameMaxLength: 100,
    descriptionMaxLength: 2000
  },

  profile: {
    nameMinLength: 2,
    nameMaxLength: 100,
    phoneFormat: /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    companyMaxLength: 100
  }
};

console.log('Subcontractors.ai Dashboard configured');
console.log(`Environment: ${isDevelopment ? 'development' : isProduction ? 'production' : 'unknown'}`);
console.log(`Demo Mode: ${window.APP_CONFIG.demoMode}`);
console.log(`Supabase Configured: ${window.SUPABASE_URL ? 'Yes' : 'No'}`);
