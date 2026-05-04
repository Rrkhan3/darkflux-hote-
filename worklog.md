---
Task ID: 1
Agent: Main Agent
Task: Implement separate login portals for admins and users, secure password storage, masked passwords in admin panel, duplicate Gmail registration prevention

Work Log:
- Updated Prisma schema to add `password` field (String, required) to User model
- Force-reset the database to apply schema changes
- Created `/src/lib/auth.ts` with scrypt-based password hashing and verification using Node.js crypto module
- Created `/src/app/api/auth/register/route.ts` - Registration endpoint with:
  - Email format validation
  - Password minimum length (6 chars)
  - Duplicate email detection (returns 409 Conflict)
  - Secure password hashing before storage
  - Admin registration key verification (darkflux2024)
- Created `/src/app/api/auth/login/route.ts` - Login endpoint with:
  - Email/password validation
  - User lookup by email
  - Password verification using timing-safe comparison
  - Returns user data without password hash
- Updated `/src/app/api/seed/route.ts` to include hashed passwords for demo users (admin123, guest123)
- Updated `/src/app/api/users/route.ts` GET to mask passwords (returns hasPassword boolean instead of hash)
- Created `/src/components/hotel/LoginPage.tsx` - Full login/register page with:
  - Customer Portal and Admin Portal tabs on the same page
  - Sign In / Register mode toggle
  - Email + Password login form
  - Registration form with name, email, password, confirm password
  - Admin registration key field for admin portal
  - Show/hide password toggle
  - Demo credentials hints
- Updated `/src/lib/stores/authStore.ts` - Replaced simple login with proper login(email, password) and register(name, email, password, role)
- Updated `/src/lib/stores/navStore.ts` - Added 'login' page, default currentPage set to 'login'
- Updated `/src/app/page.tsx` - Login gate: shows login page when not authenticated, redirects based on role after login
- Updated `/src/components/hotel/Header.tsx` - Removed role toggle, added proper logout, receives onLogout prop
- Updated `/src/components/hotel/ProfilePage.tsx` - Shows masked password field, proper logout button
- Updated `/src/components/hotel/admin/AdminCustomers.tsx` - Shows:
  - Password column with masked display (••••••••)
  - Eye/EyeOff toggle (always shows masked for security)
  - hasPassword status indicator
  - Search/filter by name, email, role
  - Security notice about password encryption
- Ran prisma generate to update client
- Build passes cleanly, ESLint passes

Stage Summary:
- Separate login portals for admin and customer on the same page
- Passwords securely hashed with Node.js crypto scrypt
- Admin panel shows user details with always-masked passwords (••••••••)
- Duplicate email registration returns 409 Conflict error
- Demo credentials: admin@darkflux.com/admin123 and guest@darkflux.com/guest123
- Admin registration requires secret key: darkflux2024
- All builds pass successfully

---
Task ID: 2
Agent: Main Agent
Task: Remove Demo Guest, show main site without login page, prompt login only on action, unify admin/customer login, secure passwords, show emails in admin panel

Work Log:
- Removed LoginPage component, replaced with LoginModal (dialog-based)
- Updated authStore to add showLoginModal, pendingAction, openLoginModal, closeLoginModal, requireAuth methods
- Updated navStore to remove 'login' page, default to 'home'
- Updated page.tsx to always show main content with Header/Footer/LoginModal, no login gate
- Updated Header to show "Sign In" button when not authenticated, proper logout, no onLogout prop
- Updated RoomsPage to prompt login modal on Book Now click if not authenticated
- Updated FoodPage to prompt login modal on Add to Cart click if not authenticated
- Updated CartPage to prompt login modal on Place Order click if not authenticated
- Updated BookingsPage to show "Sign In" button instead of static "Please log in" text
- Updated ProfilePage to show "Sign In" button instead of static text, logout redirects to home
- Updated seed route to remove Demo Guest user (only admin@darkflux.com seeded)
- LoginModal has single portal: entering admin credentials auto-redirects to admin panel
- Registration only creates customer accounts; admin access via existing admin credentials only
- Removed unused X import from RoomsPage
- Admin panel (AdminCustomers) already shows email addresses with masked passwords
- Build passes cleanly

Stage Summary:
- No login page barrier - main site visible immediately
- Login only prompted when user tries booking/ordering/profile actions
- Single login portal - admin credentials auto-detect and redirect to admin panel
- Demo Guest removed from seed data
- Secure password storage maintained, duplicate email prevention intact
- Admin panel shows user emails with masked passwords
- All builds pass successfully
