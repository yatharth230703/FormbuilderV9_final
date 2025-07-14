# Environment Setup Guide

This guide will help you set up the necessary environment variables for deploying the FormBuilder application to production.

## Required Environment Variables

### 1. Database Configuration
```bash
# PostgreSQL database connection string
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Supabase Configuration
```bash
# Supabase project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anonymous key (for client-side operations)
SUPABASE_ANON_KEY=your-anon-key-here

# Supabase service role key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Client-side Environment Variables
```bash
# For Vite build process - must be prefixed with VITE_
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Application Configuration
```bash
# Application environment
NODE_ENV=production

# Application URL (used for generating embed URLs)
APP_URL=https://your-replit-app.your-username.repl.co

# Session secret for cookie encryption
SESSION_SECRET=your-very-secure-session-secret-here
```

### 5. AI Services
```bash
# Google Gemini API key for form generation
GEMINI_API_KEY=your-gemini-api-key-here

# OpenAI API key (if using OpenAI features)
OPENAI_API_KEY=your-openai-api-key-here
```

### 6. Email Service
```bash
# Resend API key for email notifications
RESEND_API_KEY=your-resend-api-key-here
```

### 7. Payment Processing
```bash
# Stripe secret key for payment processing
STRIPE_SECRET_KEY=your-stripe-secret-key-here

# Stripe webhook secret for webhook verification
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here
```

## Setting Up Environment Variables in Replit

1. **Go to your Replit project**
2. **Click on "Secrets" in the left sidebar**
3. **Add each environment variable** by clicking "New secret"
4. **Enter the key and value** for each variable listed above

## How to Get API Keys

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the URL and anon key
5. For service role key, reveal and copy the service_role key

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### Google Maps (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API and Geocoding API
4. Create credentials (API Key)
5. Copy the API key

### Resend (Email Service)
1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Copy the API key

### Stripe (Payment Processing)
1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Go to Developers → API keys
4. Copy the secret key (starts with sk_)
5. For webhook secret, create a webhook endpoint first

## Database Setup

### PostgreSQL
1. Your Replit project should already have PostgreSQL configured
2. The DATABASE_URL should be automatically provided by Replit
3. If not, you can get it from the Database tab in Replit

### Supabase Tables
Make sure your Supabase project has the following tables:
- `users`
- `form_config`
- `form_responses`
- `session` (for session storage)

Run the migration files in the `migrations/` folder to create these tables.

## Security Considerations

1. **Never commit environment variables** to version control
2. **Use strong, unique values** for SESSION_SECRET
3. **Enable row-level security** in Supabase
4. **Restrict API key access** where possible
5. **Use HTTPS in production** (automatically handled by Replit)

## Troubleshooting

### Common Issues

1. **"Supabase client is not initialized"**
   - Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
   - Ensure the URL follows the format: `https://your-project.supabase.co`

2. **"PDF parsing is not available"**
   - This is normal in some environments, the app will still work for other file types

3. **"Failed to generate form"**
   - Check that GEMINI_API_KEY is set correctly
   - Ensure you have quota remaining in your Google AI Studio account

4. **Database connection errors**
   - Verify DATABASE_URL is correct
   - Check that your database is running

5. **Build errors**
   - Ensure all VITE_ prefixed variables are set for client-side access
   - Run `npm run build` to test the build process

## Testing Your Setup

1. **Start the application**: `npm run build && npm start`
2. **Check the console** for any initialization errors
3. **Test form generation** with a simple prompt
4. **Test file upload** functionality
5. **Check email notifications** if configured

## Production Checklist

- [ ] All required environment variables are set
- [ ] Database tables are created and migrated
- [ ] Supabase RLS policies are configured
- [ ] API keys have appropriate permissions
- [ ] Session secret is secure and unique
- [ ] APP_URL matches your actual domain
- [ ] Build process completes successfully
- [ ] All core features work (form generation, file upload, submissions)

## Support

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify all environment variables are correctly set
3. Test individual services (database, Supabase, APIs) separately
4. Review the application logs for detailed error information

Remember to keep your environment variables secure and never share them publicly! 