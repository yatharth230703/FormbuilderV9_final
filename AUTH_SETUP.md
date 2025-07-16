# Authentication Setup Guide

## Overview

The application's authentication is built on **Supabase Auth**, providing a secure and scalable solution for user management. It integrates a traditional email/password login system with a session-based approach on the server, while leveraging Supabase's powerful features for database security.

The key components of the authentication system are:
- **User Registration & Login**: Standard email and password sign-up and sign-in.
- **Session Management**: Handled by Express server using `express-session` for stateful user sessions.
- **Supabase Integration**: User creation and authentication are delegated to Supabase Auth.
- **Role-Based Access**: The `users` table includes an `is_admin` flag for role differentiation.
- **Row-Level Security (RLS)**: Data access is controlled by RLS policies defined directly in the database schema using Drizzle ORM.

## Prerequisites

- A Supabase project.
- All necessary environment variables are set up as described in `ENVIRONMENT_SETUP.md`, specifically:
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SESSION_SECRET`

## Setup and Configuration

### 1. Supabase Auth Configuration
In your Supabase project dashboard:
1.  Navigate to **Authentication** > **Providers**.
2.  Ensure the **Email** provider is enabled.
3.  (Optional) Customize the email templates for verification, password reset, etc.
4.  Navigate to **Authentication** > **URL Configuration** and set your application's URL for email redirects.

### 2. Database Schema and RLS Policies
The database schema, including tables and Row-Level Security (RLS) policies, is managed by Drizzle ORM.

The definitions can be found in `migrations/schema.ts`. Key tables include:
- `users`: Stores public user data, linked to `auth.users` via a UUID.
- `form_config`: Contains RLS policies to ensure users can only access their own forms.
- `form_responses`: Contains RLS policies so users can only view responses for their own forms.

**There is no separate SQL file to run.** The policies are defined in code and applied with the database migration command.

To set up your database, run the Drizzle Kit push command, which will synchronize your schema with the database:
```bash
npm run db:push
```

This command will create the tables and apply the RLS policies defined in the schema file.

## Authentication Flow

1.  **Client-Side (UI)**: The user interacts with the `LoginForm` or `RegisterForm` component.
2.  **API Request**: The client sends the user's credentials to the server's `/api/auth/login` or `/api/auth/register` endpoints.
3.  **Server-Side (Express)**:
    -   The server receives the request and uses the `Supabase` service to communicate with Supabase Auth.
    -   For registration, a new user is created in Supabase's `auth.users` table, and a corresponding entry is made in the public `users` table.
    -   For login, credentials are validated against Supabase Auth.
4.  **Session Creation**: Upon successful authentication, the server creates a session for the user, storing user details (like Supabase user ID and email) in the session object.
5.  **Context and Protected Routes**:
    -   The `AuthContext` on the client-side fetches the user's session data to manage the application's auth state.
    -   `ProtectedRoute` components wrap routes that require authentication, redirecting unauthenticated users.
6.  **Authenticated Requests & Data Access**:
    -   For subsequent API requests, the user's session is automatically validated.
    -   When accessing data, Supabase's RLS policies automatically filter the results based on the authenticated user's UID, ensuring they can only access data they own.

## Key Files & Components

-   **`server/auth.ts`**: Contains the Express routes for `/login`, `/register`, `/logout`.
-   **`server/services/supabase-auth.ts`**: Service functions for interacting with Supabase Auth.
-   **`client/src/contexts/AuthContext.tsx`**: React context for managing auth state in the UI.
-   **`client/src/components/auth/`**: Contains all auth-related UI components (`LoginForm`, `RegisterForm`, `ProtectedRoute`).
-   **`migrations/schema.ts`**: The single source of truth for the database schema and RLS policies.