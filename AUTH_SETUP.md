# Authentication Setup Guide

This guide explains how to set up and use the authentication system for the Forms Engine application.

## Overview

The application uses Supabase Authentication for user management with email/password login. It includes:

- User registration and login
- Role-based access control (admin vs. regular users)
- Row Level Security (RLS) policies for data protection
- Direct SQL queries to avoid schema cache issues

## Prerequisites

1. A Supabase project with the following tables:
   - `users` (with `auth_user_id` field to link with Supabase Auth)
   - `form_config`
   - `form_responses`

2. Environment variables for Supabase access:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

## Setting Up Supabase

### 1. Create necessary tables

The database schema is already defined in `shared/schema.ts`. Make sure your Supabase tables match this schema.

### 2. Apply Row Level Security (RLS) Policies

Execute the SQL in `supabase_rls_policies.sql` in your Supabase SQL editor to apply the RLS policies:

- Admins can only view/manage their own form configurations
- Admins can only view responses related to their forms
- Public users can submit form responses but not read any data

### 3. Configure Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Enable Email provider
3. Configure email templates if desired
4. Set your site URL for redirects

## Using Authentication in the Application

### Client-Side

The application uses React Context for authentication state management:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, register, logout, isLoading } = useAuth();
  
  // Use these functions and state as needed
}
```

### Protected Routes

Wrap routes requiring authentication with the ProtectedRoute component:

```javascript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

For admin-only routes:

```javascript
<ProtectedRoute requireAdmin={true}>
  <AdminComponent />
</ProtectedRoute>
```

### Server-Side

The server automatically associates created forms with the authenticated user:

```javascript
// In routes.ts
const userId = req.session.user?.supabaseUserId || null;

// This ID is used when creating form configurations
await supabaseService.createFormConfig(
  label,
  config,
  language,
  portal,
  userId
);
```

## Authentication Flow

1. User registers or logs in
2. Server creates/validates credentials with Supabase Auth
3. Server stores session data
4. Client uses protected routes based on auth state
5. Database RLS policies automatically enforce access control

## Troubleshooting

- Check browser console for client-side errors
- Verify server logs for authentication issues
- Ensure environment variables are correctly set
- Verify Supabase RLS policies are properly applied

## Further Customization

- Customize email templates in Supabase dashboard
- Add social login providers through Supabase Auth
- Implement password reset functionality
- Add multi-factor authentication (MFA)