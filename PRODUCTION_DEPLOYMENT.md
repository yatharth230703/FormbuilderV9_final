# Production Deployment Guide

This guide provides a general workflow for deploying the FormBuilder application to a production environment on platforms like Vercel, Netlify, Render, or a traditional Virtual Private Server (VPS).

## 1. Prerequisites

Before deploying, ensure you have completed the following:
-   **Environment Setup**: All required environment variables are gathered. See `ENVIRONMENT_SETUP.md` for a complete list.
-   **Supabase Project**: Your Supabase project is created, and you have the database connection string and API keys.
-   **Third-Party Services**: You have API keys for all required services (Google, Resend, Stripe).

## 2. Environment Configuration

In your chosen hosting provider's dashboard (e.g., Vercel, Netlify), you must set the environment variables required by the application.

### Key Variables for Production:
-   `NODE_ENV`: Set this to `production`.
-   `DATABASE_URL`: Your production database connection string.
-   `APP_URL`: The public URL of your deployed application (e.g., `https://your-app.com`).
-   `SESSION_SECRET`: A long, random, and secret string for session security.
-   All other API keys (`SUPABASE_*`, `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`).

## 3. Database Setup

Your production database must be migrated to the latest schema.

1.  **Connect to Production DB**: Point your `DATABASE_URL` environment variable locally to your production database instance. **Be extremely careful when doing this.**
2.  **Push Schema Changes**: Run the `db:push` command to apply any pending migrations.
    ```bash
    npm run db:push
    ```
3.  **Restore DB Connection**: Revert your local `DATABASE_URL` to your development database.

It is critical that your production database schema is up-to-date with the definitions in `migrations/schema.ts`.

## 4. Build and Deployment

The project is configured to build both the client-side assets (Vite) and the server-side code (esbuild) into a `dist` directory.

### Build & Start Commands:

-   **Build Command**: The command your hosting provider should run to build the application.
    ```bash
    npm run build
    ```
-   **Start Command**: The command to run the production server after the build is complete.
    ```bash
    npm run start
    ```

The `start` script executes the bundled server entrypoint: `node dist/index.js`.

### Static File Serving
In production, the Express server is configured to serve the static frontend files (HTML, CSS, JS) from the `dist/public` directory. Ensure your hosting provider can run a Node.js server to handle this. For platforms that are serverless-first (like Vercel), you may need to adjust the configuration to properly handle the Express server.

## 5. Deployment Checklist

Before going live, verify the following:
-   [ ] All production environment variables are set correctly in your hosting provider.
-   [ ] The `NODE_ENV` is set to `production`.
-   [ ] `APP_URL` points to the correct public domain.
-   [ ] The production database has been migrated successfully.
-   [ ] The build command (`npm run build`) completes without errors.
-   [ ] The start command (`npm run start`) launches the server successfully.
-   [ ] User authentication (register, login, logout) is working.
-   [ ] Core features like form generation, submission, and file uploads are functional.
-   [ ] Security headers and secure cookies are in place (most modern providers handle this).

## 6. Monitoring and Maintenance

-   **Logs**: Regularly check your hosting provider's logs for any runtime errors or warnings.
-   **Updates**: To deploy updates, push your code changes to your connected Git repository. Your provider should automatically trigger a new build and deployment. You may need to run database migrations manually if the schema has changed.

## Common Production Issues

-   **Static Files Not Loading (404s)**:
    -   **Cause**: The server might not be correctly configured to serve static files.
    -   **Solution**: Verify that the Express static middleware is pointing to the correct directory (`dist/public`) and that the build process places files there.

-   **Database Connection Errors**:
    -   **Cause**: Incorrect `DATABASE_URL` or network policies blocking access.
    -   **Solution**: Double-check the connection string. Ensure your hosting provider's IP address is whitelisted in your database's network settings if required.

-   **CORS Errors**:
    -   **Cause**: The server's CORS policy doesn't include your frontend's domain.
    -   **Solution**: The `server/index.ts` file configures CORS. Ensure your `APP_URL` is correct, as it's often used to configure the allowed origin. 