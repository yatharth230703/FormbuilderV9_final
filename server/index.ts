import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { storage } from "./storage";
import cors from "cors";

import dotenv from 'dotenv';
dotenv.config();

// Declare session augmentation
declare module 'express-session' {
  interface SessionData {
    user: {
      email: string;
      isAdmin: boolean;
      supabaseUserId?: string;
    };
  }
}

const app = express();
// FIRST_EDIT
// Trust the first proxy (e.g. Replit/Render/Nginx). This is REQUIRED when you
// use secure cookies behind a reverse proxy; otherwise Express thinks the
// connection is HTTP and will refuse to set/send the cookie. 1 = trust first
// hop only.
app.set('trust proxy', 1);

// Production-ready session configuration
const isProduction = process.env.NODE_ENV === 'production';

// Set your frontend URL here - updated to match your exact domain
const allowedOrigin = isProduction
  ? (process.env.APP_URL || 'https://formbuilder-v-9-final-2-partnerscaile.replit.app')
  : 'http://localhost:5173';

// For debugging: log the CORS configuration
console.log('CORS configuration:', {
  isProduction,
  allowedOrigin,
  nodeEnv: process.env.NODE_ENV
});

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize session middleware with PostgreSQL session store from storage
app.use(session({
  // SECOND_EDIT
  // When running behind a proxy _and_ using secure cookies we must tell
  // express-session about it, otherwise the secure cookie will not be
  // accepted. Only enable this flag in production to avoid warnings during
  // local development.
  proxy: isProduction,
  store: storage.sessionStore,
  name: 'forms_engine_sid',
  secret: process.env.SESSION_SECRET || 'forms-engine-session-secret', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: isProduction, // Set to true in production with HTTPS
    sameSite: isProduction ? 'none' : 'lax'
  }
}));

// Debug middleware to log session and cookie info (AFTER session middleware)
app.use((req, res, next) => {
  // Only log API requests to avoid spam
  if (req.path.startsWith('/api')) {
    console.log('API Request details:', {
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      sessionID: req.sessionID,
      hasSessionUser: !!(req.session && req.session.user),
      hasCookies: !!req.headers.cookie
    });
  }
  next();
});

// Security headers for production
if (isProduction) {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  const originalResSend = res.send;
  res.send = function (bodyStr, ...args) {
    return originalResSend.apply(res, [bodyStr, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  const host = '0.0.0.0'
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();

