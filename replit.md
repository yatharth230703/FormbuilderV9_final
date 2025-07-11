# Forms Engine - Prompt to Form Generator

## Overview

This is a full-stack web application that generates interactive forms from natural language prompts using AI. Users can describe their form requirements in plain English, and the system automatically creates customizable, multi-step forms with various input types including tiles, sliders, text boxes, dropdowns, and more.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Supabase as the hosted database provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth with custom user management
- **AI Integration**: Google Gemini API for form generation from prompts
- **Payment Processing**: Stripe integration for credit-based system
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Components

### Backend Services
- **Form Generation Service**: Uses Gemini AI to convert natural language prompts into form configurations
- **Icon/Emoji Services**: Automatically generates appropriate icons and emojis for form options
- **Authentication Service**: Handles user registration, login, and session management
- **API Key Service**: Manages API keys for programmatic access
- **Supabase Integration**: Database operations and Row Level Security (RLS) policies
- **Console Functions**: Drop-in modular functions for form automation and customization

### Frontend Components
- **Form Builder**: Interactive form creation interface with real-time preview
- **Form Renderer**: Displays generated forms with multiple step types
- **Theme Customization**: Live theme editing with color and font selection
- **Dashboard**: User management interface for created forms
- **Embed System**: Generates embeddable iframe code for forms
- **Form Console**: Advanced configuration interface with IF-THEN automation rules

### Database Schema
- **Users**: User accounts with authentication linking to Supabase Auth
- **Form Config**: Stores form configurations with JSON structure
- **Form Responses**: Captures user submissions linked to specific forms
- **Session Management**: PostgreSQL-based session storage

## Data Flow

1. **Form Creation**: User enters prompt → Gemini API generates form JSON → Saved to database
2. **Form Editing**: Live JSON editing with real-time preview updates
3. **Form Publishing**: Forms get unique IDs and can be embedded or shared
4. **Response Collection**: Public form submissions stored with form association
5. **Authentication Flow**: Supabase Auth handles login/registration → Custom user records created
6. **Console Automation**: IF-THEN conditions → AI processing → Console functions execution

## External Dependencies

- **Google Gemini API**: For AI-powered form generation from natural language
- **Supabase**: Database hosting, authentication, and real-time features
- **Stripe**: Payment processing for credit purchases
- **Lucide React**: Icon library for UI components
- **shadcn/ui**: Pre-built UI component library
- **Radix UI**: Accessible component primitives

## Deployment Strategy

The application is configured for deployment on Replit with:
- Node.js 20 runtime environment
- PostgreSQL 16 database module
- Vite development server on port 5000
- Production build process using esbuild for server bundling
- Environment variables for all external service configurations

Database migrations are managed through Drizzle Kit with schema definitions in TypeScript. The application uses session-based authentication with PostgreSQL session storage for reliability.

## Console Functions Architecture

The application includes a modular console functions system for advanced form automation:

### Drop-in Functions
- **Auto-select First Option**: Automatically pre-selects form options based on AI-processed conditions
- **Send Brochure**: Sends targeted email content when specific keywords are detected in responses
- **Modular Design**: Functions can be easily added, removed, or modified without affecting existing code

### Integration Pattern
1. User configures IF-THEN rules in Form Console frontend
2. AI agents process natural language conditions into structured JSON
3. Console functions execute based on condition matching
4. Results are logged and tracked for monitoring

### Technical Implementation
- TypeScript-first with comprehensive type safety
- Form-specific execution using formId parameter
- Non-destructive to existing functionalities
- Comprehensive error handling and logging

## Changelog

- June 24, 2025. Initial setup
- January 8, 2025. Added Form Console frontend with IF-THEN framework
- January 8, 2025. Implemented console functions backend with drop-in architecture
- January 9, 2025. Connected frontend to backend with persistent database storage
  - Added form_console column to form_config table
  - Implemented API endpoints for console configuration management
  - Added form selection dropdown and persistent settings
  - Connected "Process Condition" buttons to backend AI processing
  - Added proper error handling and loading states
- January 10, 2025. Major console system revamp with function-based architecture
  - Completely rebuilt Form Console interface removing AI dependency
  - Implemented new JSON structure for form_console column
  - Added Form Config section with auto-select-first-option function
  - Added Response Config section with send-brochure function
  - Created console executor system that integrates with form submission
  - Removed old AI-processed endpoints and simplified configuration
  - Added form preview endpoint that applies console functions

## User Preferences

Preferred communication style: Simple, everyday language.