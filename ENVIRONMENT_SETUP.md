# Environment Setup Guide

This guide will help you set up the necessary environment variables for running the FormBuilder application locally and deploying it to production.

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)
- A [Supabase](https://supabase.com) account
- A [Google Cloud Platform](https://console.cloud.google.com/) account for Google Maps API.
- A [Resend](https://resend.com) account for email services.
- A [Stripe](https://stripe.com) account for payment processing.

## 2. Local Installation

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/formbuilderv9.git
cd formbuilderv9
npm install
```

## 3. Environment Variables

Create a `.env` file in the root of the project. You can copy the example below.

### `.env.example`

```env
# ------------------------------
# DATABASE & SUPABASE
# ------------------------------
# Your PostgreSQL connection string (e.g., from Supabase)
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase Project URL
SUPABASE_URL="https://your-project-id.supabase.co"

# Supabase Anon Key (safe for client-side use)
SUPABASE_ANON_KEY="your-anon-key-here"

# Supabase Service Role Key (for server-side admin operations, keep this secret)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"


# ------------------------------
# CLIENT-SIDE (VITE)
# ------------------------------
# These variables are exposed to the frontend and must be prefixed with VITE_.
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"


# ------------------------------
# APPLICATION & SESSION
# ------------------------------
# The base URL of your deployed application
APP_URL="http://localhost:5173"

# A long, random string for securing sessions
SESSION_SECRET="your-super-secret-session-string"

# Set to "production" when deployed
NODE_ENV="development"


# ------------------------------
# THIRD-PARTY SERVICES API KEYS
# ------------------------------
# Google Gemini API key for AI features
GEMINI_API_KEY="your-gemini-api-key"

# Google Maps API key for location services
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Resend API key for sending emails
RESEND_API_KEY="your-resend-api-key"

# Stripe Secret Key for processing payments
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
```

### How to Get Your API Keys

- **Supabase**:
  1. Go to your project on [supabase.com](https://supabase.com).
  2. Navigate to **Settings** > **API**.
  3. You will find your **Project URL**, **Anon Key**, and **Service Role Key**.
  4. Your `DATABASE_URL` can be found under **Settings** > **Database**.

- **Google (Gemini & Maps)**:
  1. For the **Gemini API Key**, go to [Google AI Studio](https://makersuite.google.com/app/apikey).
  2. For the **Google Maps API Key**, go to the [Google Cloud Console](https://console.cloud.google.com/), create a project, and enable the **Maps JavaScript API** and **Geocoding API**.

- **Resend**:
  1. Sign up on [resend.com](https://resend.com).
  2. Go to the **API Keys** section and create a new key.

- **Stripe**:
  1. Sign up on [stripe.com](https://stripe.com).
  2. Go to **Developers** > **API keys** to find your **Secret Key**.

## 4. Database Setup

The application uses Drizzle ORM to manage the database schema. After setting up your `DATABASE_URL` in the `.env` file, run the migrations to create the required tables.

The following tables will be created:
- `users`: Stores user information, credits, and API keys.
- `form_config`: Stores the configuration and structure of created forms.
- `form_responses`: Stores submissions for each form.
- `session`: Manages user sessions.

To apply the schema to your database, run the following command:

```bash
npm run db:push
```

## 5. Running the Application

### Development
To run the application in development mode with hot-reloading:
```bash
npm run dev
```
The server will start on the port specified in `server/index.ts` (default is 5000), and the client will be available on port 5173.

### Production
To build the application for production and start the server:
```bash
# 1. Build the client and server
npm run build

# 2. Start the production server
npm run start
```

## Troubleshooting

- **"Supabase client is not initialized"**: Double-check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in your `.env` file and that you are loading them correctly in your client-side code.
- **Database Connection Errors**: Ensure your `DATABASE_URL` is correct and your database is accessible.
- **Authentication Issues**: Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct for server-side operations. 