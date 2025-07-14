# Production Deployment Guide for Replit

This guide will walk you through deploying the FormBuilder application to production on Replit.

## Prerequisites

Before starting deployment, ensure you have:
- [ ] A Replit account
- [ ] All required environment variables (see `ENVIRONMENT_SETUP.md`)
- [ ] A Supabase project with proper tables
- [ ] API keys for required services

## Step 1: Environment Configuration

### 1.1 Set Environment Variables
1. In your Replit project, click on "Secrets" in the left sidebar
2. Add all the required environment variables listed in `ENVIRONMENT_SETUP.md`
3. Make sure to set `NODE_ENV=production`

### 1.2 Configure APP_URL
Set your APP_URL to match your Replit deployment URL:
```
APP_URL=https://your-replit-name.your-username.repl.co
```

## Step 2: Database Setup

### 2.1 PostgreSQL (Local Database)
Your Replit project should automatically provision a PostgreSQL database. If not:
1. Go to the Database tab in Replit
2. Enable PostgreSQL
3. Copy the DATABASE_URL from the connection details

### 2.2 Supabase Setup
1. Make sure your Supabase project is properly configured
2. Run database migrations to create required tables
3. Set up Row Level Security (RLS) policies
4. Test the connection with your environment variables

## Step 3: Build Configuration

### 3.1 Build Process
The application uses a two-step build process:
1. **Client build**: `vite build` - builds the React frontend
2. **Server build**: `esbuild` - bundles the Express server

### 3.2 Static File Serving
In production, the server serves static files from `dist/public/`

## Step 4: Deployment

### 4.1 Deploy to Replit
1. **Push your code** to your Replit project
2. **Set environment variables** in Replit Secrets
3. **Run the build command**:
   ```bash
   npm run build
   ```
4. **Start the production server**:
   ```bash
   npm start
   ```

### 4.2 Automated Deployment
The `.replit` file is configured to automatically:
- Build the application on deployment
- Start the production server
- Serve on port 5000

## Step 5: Verification

### 5.1 Health Checks
After deployment, verify:
1. **Application starts** without errors
2. **Database connection** is working
3. **API endpoints** respond correctly
4. **Form generation** works with AI service
5. **File uploads** function properly
6. **Static files** are served correctly

### 5.2 Test Core Features
- [ ] User authentication
- [ ] Form generation from prompts
- [ ] Form rendering and submission
- [ ] File upload and processing
- [ ] Email notifications (if configured)
- [ ] Payment processing (if configured)

## Step 6: Production Optimizations

### 6.1 Performance
- Static files are served with proper caching headers
- Session storage uses PostgreSQL for persistence
- PDF processing is optimized for production environments

### 6.2 Security
- HTTPS is enforced (automatically by Replit)
- Security headers are set for all responses
- Session cookies are configured securely
- Input validation and sanitization

### 6.3 Error Handling
- Comprehensive error logging
- Graceful degradation for optional features
- User-friendly error messages

## Step 7: Monitoring and Maintenance

### 7.1 Logs
Monitor application logs for:
- Error messages
- Performance issues
- Security concerns
- User activity

### 7.2 Updates
To update your deployment:
1. Make changes to your code
2. Push to Replit
3. Run `npm run build`
4. Restart the application

## Common Issues and Solutions

### Issue: Build Fails
**Solution**: 
- Check that all environment variables are set
- Ensure all dependencies are installed
- Verify Node.js version compatibility

### Issue: Database Connection Errors
**Solution**:
- Verify DATABASE_URL is correct
- Check Supabase credentials
- Ensure database is running

### Issue: Static Files Not Loading
**Solution**:
- Verify build completed successfully
- Check file permissions
- Ensure `dist/public` directory exists

### Issue: PDF Upload Not Working
**Solution**:
- This is expected in some environments
- Other file types (DOC, TXT) should still work
- Check file size limits

### Issue: Form Generation Fails
**Solution**:
- Verify GEMINI_API_KEY is set correctly
- Check API quota limits
- Test with simpler prompts

## Performance Optimization

### 6.1 Caching Strategy
- Static assets cached for 1 year
- HTML files cached with validation
- API responses not cached (dynamic content)

### 6.2 Resource Limits
- PDF processing limited to 50 pages
- File upload limited to 10MB
- Session timeout set to 30 days

## Security Best Practices

### 7.1 Environment Variables
- Never commit secrets to version control
- Use strong, unique session secrets
- Regularly rotate API keys

### 7.2 Input Validation
- All user inputs are validated
- File uploads are type-checked
- SQL injection prevention

### 7.3 Session Security
- HTTPOnly cookies
- Secure cookie flags in production
- CSRF protection

## Backup and Recovery

### 8.1 Database Backups
- Supabase handles automatic backups
- Export important data regularly
- Keep migration files version controlled

### 8.2 Code Backups
- Keep code in version control
- Tag releases for rollback capability
- Document configuration changes

## Scaling Considerations

### 9.1 Current Limitations
- Single server instance
- File storage on server filesystem
- Session storage in PostgreSQL

### 9.2 Future Scaling Options
- Move to cloud file storage (AWS S3, etc.)
- Implement horizontal scaling
- Add caching layer (Redis)
- Use CDN for static assets

## Troubleshooting Commands

```bash
# Check if build was successful
ls -la dist/public

# Test database connection
npm run check

# View recent logs
tail -f server.log

# Restart application
npm start

# Full rebuild
rm -rf dist && npm run build
```

## Support

If you encounter issues:
1. Check the console logs for specific errors
2. Verify all environment variables are correctly set
3. Test individual components separately
4. Review the deployment checklist
5. Check Replit status page for service issues

## Deployment Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Database tables created and migrated
- [ ] API keys tested and working
- [ ] Build process completes successfully
- [ ] Application starts without errors
- [ ] All core features tested
- [ ] Security headers configured
- [ ] Error handling tested
- [ ] Performance optimizations applied
- [ ] Monitoring configured
- [ ] Backup strategy in place

## Post-Deployment

After successful deployment:
1. Monitor application performance
2. Watch for error logs
3. Test user workflows
4. Gather user feedback
5. Plan for future updates

Remember: Keep your environment variables secure and never share them publicly! 