/**
 * Subcontractors.ai Dashboard
 * Core application logic and state management
 * Handles authentication, data operations, and UI utilities
 */

// =============================================================================
// SUPABASE CONFIGURATION
// =============================================================================

const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

var sbClient = null;
let currentUser = null;
let userProfile = null;

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
function isConfigured() {
  return SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== '';
}

/**
 * Get demo mode status from config
 * @returns {boolean}
 */
function isDemoMode() {
  return !isConfigured() || (window.APP_CONFIG && window.APP_CONFIG.demoMode);
}

// =============================================================================
// APP INITIALIZATION
// =============================================================================

/**
 * Initialize the application
 * Checks Supabase configuration and restores session if available
 * @async
 */
async function initApp() {
  try {
    if (!isConfigured()) {
      console.log('Supabase not configured — running in demo mode');
      const demoUser = JSON.parse(localStorage.getItem('demo_user') || 'null');
      if (demoUser) {
        currentUser = demoUser;
        userProfile = JSON.parse(localStorage.getItem('demo_profile') || '{}');
      }
      return;
    }

    // Initialize Supabase client (loaded via CDN in HTML)
    if (window.supabase && window.supabase.createClient) {
      sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data: { session } } = await sbClient.auth.getSession();
      if (session && session.user) {
        currentUser = session.user;
        userProfile = await loadUserProfile();
      }
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

/**
 * Call this on app load to check authentication and require it
 * Redirects to login if not authenticated
 * @async
 */
async function checkAuthAndInit() {
  await initApp();
  if (!currentUser && !isDemoMode()) {
    window.location.href = 'login.html';
  }
}

// =============================================================================
// AUTHENTICATION FUNCTIONS
// =============================================================================

/**
 * Sign up a new user
 * @async
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} metadata - Additional user metadata
 * @returns {Promise<{user: object, error: object}>}
 */
async function signUp(email, password, metadata = {}) {
  if (isDemoMode()) {
    const demoUser = {
      id: 'demo-' + Date.now(),
      email,
      user_metadata: metadata,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    currentUser = demoUser;
    userProfile = {};
    localStorage.setItem('demo_profile', JSON.stringify(userProfile));
    return { user: demoUser, error: null };
  }

  const { data, error } = await sbClient.auth.signUp({
    email,
    password,
    options: { data: metadata }
  });

  if (data && data.user) {
    currentUser = data.user;
    // Create profile entry
    await sbClient.from('profiles').insert({
      id: data.user.id,
      email: email,
      created_at: new Date().toISOString()
    }).catch(() => {}); // Ignore if already exists
  }

  return { user: data?.user, error };
}

/**
 * Sign in an existing user
 * @async
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object, error: object}>}
 */
async function signIn(email, password) {
  if (isDemoMode()) {
    // Demo mode: auto-create or load demo user
    const demoUser = JSON.parse(localStorage.getItem('demo_user') || 'null');

    if (demoUser && demoUser.email === email) {
      currentUser = demoUser;
      userProfile = JSON.parse(localStorage.getItem('demo_profile') || '{}');
      return { user: demoUser, error: null };
    }

    // Auto-create new demo user
    const newUser = {
      id: 'demo-' + Date.now(),
      email,
      user_metadata: {},
      created_at: new Date().toISOString()
    };
    localStorage.setItem('demo_user', JSON.stringify(newUser));
    currentUser = newUser;
    userProfile = {};
    localStorage.setItem('demo_profile', JSON.stringify(userProfile));
    return { user: newUser, error: null };
  }

  const { data, error } = await sbClient.auth.signInWithPassword({
    email,
    password
  });

  if (data && data.user) {
    currentUser = data.user;
    userProfile = await loadUserProfile();
  }

  return { user: data?.user, error };
}

/**
 * Sign out current user
 * @async
 */
async function signOut() {
  // Clear all local storage
  localStorage.removeItem('demo_user');
  localStorage.removeItem('demo_profile');
  localStorage.removeItem('demo_payments');
  localStorage.removeItem('demo_projects');
  localStorage.removeItem('sb-demo-user');
  localStorage.removeItem('sb-demo-session');

  if (sbClient) {
    try { await sbClient.auth.signOut(); } catch(e) {}
  }
  currentUser = null;
  userProfile = null;
  window.location.href = 'login.html';
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return currentUser !== null && currentUser !== undefined;
}

/**
 * Get current user
 * @returns {object|null}
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Get current user profile
 * @returns {object}
 */
function getUserProfile() {
  return userProfile || {};
}

// =============================================================================
// AUTHORIZATION FUNCTIONS
// =============================================================================

/**
 * Require authentication — initializes Supabase, checks session, redirects if needed
 * @async
 * @returns {Promise<object|null>} The current user object, or null (redirects to login)
 */
async function requireAuth() {
  // Initialize Supabase client if not already done
  if (!sbClient && isConfigured() && window.supabase && window.supabase.createClient) {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (sbClient) {
    try {
      const { data: { session } } = await sbClient.auth.getSession();
      if (session && session.user) {
        currentUser = session.user;
        return currentUser;
      }
    } catch (e) {
      console.error('Auth check error:', e);
    }
  }

  // Check demo mode fallback
  if (isDemoMode()) {
    const demoUser = JSON.parse(localStorage.getItem('demo_user') || localStorage.getItem('sb-demo-user') || 'null');
    if (demoUser) {
      currentUser = demoUser;
      return currentUser;
    }
  }

  // No session found — redirect to login
  window.location.href = 'login.html';
  return null;
}

/**
 * Require admin access
 * @returns {boolean}
 */
function requireAdmin() {
  const adminEmails = window.ADMIN_EMAILS || ['connor@acglass.com'];
  if (!isAuthenticated() || !adminEmails.includes(currentUser.email)) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
function isAdmin() {
  const adminEmails = window.ADMIN_EMAILS || ['connor@acglass.com'];
  return isAuthenticated() && adminEmails.includes(currentUser.email);
}

// =============================================================================
// PROFILE FUNCTIONS
// =============================================================================

/**
 * Load user profile from database
 * @async
 * @returns {Promise<object>}
 */
async function loadUserProfile() {
  if (isDemoMode()) {
    return JSON.parse(localStorage.getItem('demo_profile') || '{}');
  }

  if (!sbClient || !currentUser) return {};

  try {
    const { data } = await sbClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    userProfile = data || {};
    return userProfile;
  } catch (error) {
    console.error('Error loading profile:', error);
    return {};
  }
}

/**
 * Save user profile
 * @async
 * @param {object} profile - Profile data to save
 * @returns {Promise<{data: object, error: object}>}
 */
async function saveUserProfile(profile) {
  if (isDemoMode()) {
    userProfile = { ...userProfile, ...profile };
    localStorage.setItem('demo_profile', JSON.stringify(userProfile));
    return { data: userProfile, error: null };
  }

  if (!sbClient || !currentUser) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  try {
    const { data, error } = await sbClient
      .from('profiles')
      .upsert({
        id: currentUser.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      userProfile = { ...userProfile, ...profile };
    }
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// =============================================================================
// PAYMENT FUNCTIONS
// =============================================================================

/**
 * Get all payments for current user
 * @async
 * @returns {Promise<array>}
 */
async function getPayments() {
  if (isDemoMode()) {
    return JSON.parse(localStorage.getItem('demo_payments') || '[]');
  }

  if (!sbClient || !currentUser) return [];

  try {
    const { data } = await sbClient
      .from('payments')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('due_date', { ascending: false });
    return data || [];
  } catch (error) {
    console.error('Error loading payments:', error);
    return [];
  }
}

/**
 * Add a new payment
 * @async
 * @param {object} payment - Payment data
 * @returns {Promise<{data: object, error: object}>}
 */
async function addPayment(payment) {
  if (isDemoMode()) {
    const payments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
    const newPayment = {
      id: 'pay-' + Date.now(),
      user_id: currentUser?.id || 'demo-user',
      ...payment,
      created_at: new Date().toISOString()
    };
    payments.push(newPayment);
    localStorage.setItem('demo_payments', JSON.stringify(payments));
    return { data: newPayment, error: null };
  }

  if (!sbClient || !currentUser) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  try {
    const { data, error } = await sbClient
      .from('payments')
      .insert({
        user_id: currentUser.id,
        ...payment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update a payment
 * @async
 * @param {string} id - Payment ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object, error: object}>}
 */
async function updatePayment(id, updates) {
  if (isDemoMode()) {
    const payments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
    const idx = payments.findIndex(p => p.id === id);
    if (idx >= 0) {
      payments[idx] = { ...payments[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('demo_payments', JSON.stringify(payments));
      return { data: payments[idx], error: null };
    }
    return { data: null, error: { message: 'Payment not found' } };
  }

  if (!sbClient) {
    return { data: null, error: { message: 'Not configured' } };
  }

  try {
    const { data, error } = await sbClient
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete a payment
 * @async
 * @param {string} id - Payment ID
 * @returns {Promise<{error: object}>}
 */
async function deletePayment(id) {
  if (isDemoMode()) {
    const payments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
    const filtered = payments.filter(p => p.id !== id);
    localStorage.setItem('demo_payments', JSON.stringify(filtered));
    return { error: null };
  }

  if (!sbClient) {
    return { error: { message: 'Not configured' } };
  }

  try {
    const { error } = await sbClient
      .from('payments')
      .delete()
      .eq('id', id);
    return { error };
  } catch (error) {
    return { error };
  }
}

// =============================================================================
// PROJECT FUNCTIONS
// =============================================================================

/**
 * Get all projects for current user
 * @async
 * @returns {Promise<array>}
 */
async function getProjects() {
  if (isDemoMode()) {
    return JSON.parse(localStorage.getItem('demo_projects') || '[]');
  }

  if (!sbClient || !currentUser) return [];

  try {
    const { data } = await sbClient
      .from('projects')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    return data || [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Add a new project
 * @async
 * @param {object} project - Project data
 * @returns {Promise<{data: object, error: object}>}
 */
async function addProject(project) {
  if (isDemoMode()) {
    const projects = JSON.parse(localStorage.getItem('demo_projects') || '[]');
    const newProject = {
      id: 'proj-' + Date.now(),
      user_id: currentUser?.id || 'demo-user',
      ...project,
      created_at: new Date().toISOString()
    };
    projects.push(newProject);
    localStorage.setItem('demo_projects', JSON.stringify(projects));
    return { data: newProject, error: null };
  }

  if (!sbClient || !currentUser) {
    return { data: null, error: { message: 'Not authenticated' } };
  }

  try {
    const { data, error } = await sbClient
      .from('projects')
      .insert({
        user_id: currentUser.id,
        ...project,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update a project
 * @async
 * @param {string} id - Project ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object, error: object}>}
 */
async function updateProject(id, updates) {
  if (isDemoMode()) {
    const projects = JSON.parse(localStorage.getItem('demo_projects') || '[]');
    const idx = projects.findIndex(p => p.id === id);
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('demo_projects', JSON.stringify(projects));
      return { data: projects[idx], error: null };
    }
    return { data: null, error: { message: 'Project not found' } };
  }

  if (!sbClient) {
    return { data: null, error: { message: 'Not configured' } };
  }

  try {
    const { data, error } = await sbClient
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete a project
 * @async
 * @param {string} id - Project ID
 * @returns {Promise<{error: object}>}
 */
async function deleteProject(id) {
  if (isDemoMode()) {
    const projects = JSON.parse(localStorage.getItem('demo_projects') || '[]');
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem('demo_projects', JSON.stringify(filtered));
    return { error: null };
  }

  if (!sbClient) {
    return { error: { message: 'Not configured' } };
  }

  try {
    const { error } = await sbClient
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  } catch (error) {
    return { error };
  }
}

// =============================================================================
// ADMIN FUNCTIONS
// =============================================================================

/**
 * Get all users (admin only)
 * @async
 * @returns {Promise<array>}
 */
async function getAllUsers() {
  if (!isAdmin()) return [];

  if (isDemoMode()) {
    const demoUser = JSON.parse(localStorage.getItem('demo_user') || 'null');
    return demoUser ? [demoUser] : [];
  }

  if (!sbClient) return [];

  try {
    const { data } = await sbClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Get all payments (admin only)
 * @async
 * @returns {Promise<array>}
 */
async function getAllPayments() {
  if (!isAdmin()) return [];

  if (isDemoMode()) {
    return JSON.parse(localStorage.getItem('demo_payments') || '[]');
  }

  if (!sbClient) return [];

  try {
    const { data } = await sbClient
      .from('payments')
      .select('*, profiles(email, name)')
      .order('due_date', { ascending: false });
    return data || [];
  } catch (error) {
    console.error('Error loading all payments:', error);
    return [];
  }
}

// =============================================================================
// UI UTILITY FUNCTIONS
// =============================================================================

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @returns {string}
 */
function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date string
 * @param {string} dateStr - Date string to format
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date and time
 * @param {string} dateStr - Date string to format
 * @returns {string}
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Calculate days until/since a date
 * @param {string} dateStr - Date string
 * @returns {number}
 */
function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * Get payment status based on due date and paid status
 * @param {string} dueDate - Due date string
 * @param {boolean} isPaid - Whether payment is marked as paid
 * @returns {string}
 */
function getPaymentStatus(dueDate, isPaid) {
  if (isPaid) return 'paid';
  const days = daysFromNow(dueDate);
  if (days === null) return 'unknown';
  if (days < 0) return 'overdue';
  if (days === 0) return 'due-today';
  if (days <= 7) return 'due-soon';
  return 'pending';
}

/**
 * Get status badge text
 * @param {string} status - Status value
 * @returns {string}
 */
function getStatusText(status) {
  const statusMap = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue',
    'due-today': 'Due Today',
    'due-soon': 'Due Soon',
    'current': 'Current',
    'expiring': 'Expiring Soon',
    'expired': 'Expired'
  };
  return statusMap[status] || status;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (0 = persistent)
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const container = document.getElementById('toast-container') || createToastContainer();
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

/**
 * Create toast container if it doesn't exist
 * @returns {HTMLElement}
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Show loading state on element
 * @param {HTMLElement} element - Element to show loading on
 */
function showLoading(element) {
  if (!element) return;
  element.classList.add('loading');
  element.disabled = true;
}

/**
 * Hide loading state on element
 * @param {HTMLElement} element - Element to hide loading on
 */
function hideLoading(element) {
  if (!element) return;
  element.classList.remove('loading');
  element.disabled = false;
}

// =============================================================================
// NAVIGATION AND DOM HELPERS
// =============================================================================

/**
 * Navigate to a page
 * @param {string} page - Page name or path
 */
function navigateTo(page) {
  window.location.href = page.endsWith('.html') ? page : page + '.html';
}

/**
 * Set active navigation item
 * @param {string} pageId - Page ID to mark as active
 */
function setActiveNav(pageId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeItem = document.querySelector(`[data-page="${pageId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

/**
 * Update page title and breadcrumb
 * @param {string} title - Page title
 * @param {array} breadcrumbs - Breadcrumb path
 */
function setPageTitle(title, breadcrumbs = []) {
  const titleEl = document.querySelector('.page-title');
  const breadcrumbEl = document.querySelector('.breadcrumb');

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (breadcrumbEl && breadcrumbs.length > 0) {
    breadcrumbEl.innerHTML = breadcrumbs
      .map((item, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${item}</span>`;
      })
      .join('<span class="separator">/</span>');
  }
}

/**
 * Initialize sidebar navigation
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      if (page === 'sign-out') {
        signOut();
      } else {
        navigateTo(page);
      }
    });
  });

  // Hide admin section if not admin
  const adminSection = document.querySelector('.nav-section.admin');
  if (adminSection && !isAdmin()) {
    adminSection.style.display = 'none';
  }
}

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

// =============================================================================
// DATA VALIDATION
// =============================================================================

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(phone);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
