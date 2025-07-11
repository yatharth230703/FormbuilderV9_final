import { Router, Request, Response } from "express";
import { z } from "zod";
import * as supabaseAuth from "./services/supabase-auth";

// Auth route handler
const router = Router();

// Schemas for validation
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Register route
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validateData = registerSchema.safeParse(req.body);

    if (!validateData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validateData.error.errors
      });
    }

    const { username, email, password } = validateData.data;

    // Register user with Supabase Auth and store in users table
    const user = await supabaseAuth.registerUser(email, password, username);

    // Create session
    req.session.user = {
      email: user.email,
      isAdmin: user.isAdmin,
      supabaseUserId: user.uuid
    };

    // Explicitly save the session to ensure it's stored
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session after registration:', err);
      } else {
        console.log('Session successfully saved after registration for user:', user.id);
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during registration";
    return res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
});

// Login route
router.post("/login", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validateData = loginSchema.safeParse(req.body);

    if (!validateData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validateData.error.errors
      });
    }

    const { email, password } = validateData.data;

    // Login user with Supabase Auth
    const result = await supabaseAuth.loginUser(email, password);

    // Create session
    req.session.user = {
      email: result.user.email,
      isAdmin: result.user.isAdmin,
      supabaseUserId: result.user.uuid
    };

    // Log session
    console.log('Creating login session with user ID:', result.user.uuid);
    console.log('Session before save:', req.sessionID, JSON.stringify(req.session, null, 2));

    // Explicitly save the session to ensure it's stored
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session after login:', err);
      } else {
        console.log('Session successfully saved after login for user:', result.user.uuid);
        console.log('Session after save:', req.sessionID, JSON.stringify(req.session, null, 2));
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          isAdmin: result.user.isAdmin
        },
        token: result.token
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during login";
    return res.status(401).json({
      success: false,
      message: errorMessage
    });
  }
});

// Logout route
router.post("/logout", async (req: Request, res: Response) => {
  try {
    // Logout from Supabase Auth
    await supabaseAuth.logoutUser();

    // Clear session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to logout"
        });
      }

      res.clearCookie("forms_engine_sid");
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during logout";
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Get current user route
router.get("/user", async (req: Request, res: Response) => {
  try {
    // Debug session state
    console.log('Session user data:', req.session.user);

    // Check for user in session first (express session)
    if (req.session.user && req.session.user.supabaseUserId) {
      console.log('Found session with user ID:', req.session.user.supabaseUserId);

      // Pass the user ID from session to getCurrentUser
      const currentUser = await supabaseAuth.getCurrentUser(req.session.user.supabaseUserId);

      if (currentUser) {
        console.log('Successfully retrieved user from session ID');
        return res.status(200).json({
          success: true,
          isAuthenticated: true,
          user: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            isAdmin: currentUser.isAdmin
          }
        });
      } else {
        console.log('Session user ID did not retrieve a valid user, clearing session');
        req.session.destroy((err) => {
          if (err) console.error('Error destroying invalid session:', err);
        });
      }
    }

    // Try to get user from Supabase auth if not in session
    console.log('Attempting to get user from Supabase auth');
    const currentUser = await supabaseAuth.getCurrentUser();

    if (currentUser) {
      console.log('User authenticated via Supabase, updating session');
      // Update session
      req.session.user = {
        email: currentUser.email,
        isAdmin: currentUser.isAdmin,
        supabaseUserId: currentUser.uuid
      };

      // Save session explicitly
      req.session.save((err) => {
        if (err) console.error('Error saving session:', err);
      });

      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          isAdmin: currentUser.isAdmin
        }
      });
    }

    // No authenticated user found
    console.log('No authenticated user found');
    return res.status(200).json({
      success: true,
      isAuthenticated: false
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user information"
    });
  }
});

export default router;