import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { AdminLoginRequest } from "@shared/types";
import { z } from "zod";
import * as supabaseService from "./services/supabase";

// Email validation schema
const emailSchema = z.string().email("Invalid email format");

// Admin route handler
const router = Router();

// Middleware to check if user is authenticated as admin
export const requireAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Admin access required"
    });
  }
  next();
};

// Login route - simple email-based authentication for admin
// Per user's request, this will accept any valid email address for admin access
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as AdminLoginRequest;

    // Validate email
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address"
      });
    }

    // Accept any valid email for admin access (as requested)
    // Create admin session
    req.session.user = {
      email,
      isAdmin: true
    };

    return res.status(200).json({
      success: true,
      message: "Admin login successful"
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});

// Logout route
router.post("/logout", (req: Request, res: Response) => {
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
});

// Check authentication status
router.get("/status", (req: Request, res: Response) => {
  if (req.session.user && req.session.user.isAdmin) {
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: {
        email: req.session.user.email,
        isAdmin: true
      }
    });
  }

  return res.status(200).json({
    success: true,
    isAuthenticated: false
  });
});

// Get all form responses - protected by admin middleware
router.get("/responses", requireAdmin, async (_req: Request, res: Response) => {
  try {
    // First try Supabase service
    try {
      console.log('Attempting to get form responses from Supabase...');
      const responses = await supabaseService.getAllFormResponses();

      // Map responses to a more user-friendly format
      const formattedResponses = responses.map(response => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || new Date().toISOString(),
        // Access the response_data field from Supabase structure
        responses: response.response_data || {}
      }));

      return res.status(200).json({
        success: true,
        source: 'supabase',
        data: formattedResponses
      });
    } catch (supabaseError) {
      console.error('Supabase service failed, falling back to database storage:', supabaseError);

      // Fallback to database storage
      const responses = await storage.getFormResponses();

      // Map responses to a more user-friendly format
      const formattedResponses = responses.map(response => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || new Date().toISOString(),
        responses: response.response || {}
      }));

      return res.status(200).json({
        success: true,
        source: 'database',
        data: formattedResponses
      });
    }
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch form responses"
    });
  }
});

// Get responses for a specific form by label
router.get("/responses/:label", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label } = req.params;

    if (!label) {
      return res.status(400).json({
        success: false,
        message: "Form label is required"
      });
    }

    console.log(`Getting responses for label: ${label}`);

    // Try Supabase first
    try {
      console.log('Attempting to get form responses by label from Supabase...');

      // Get responses from Supabase using exact label match
      let responses = await supabaseService.getFormResponsesByLabel(label);

      // If no responses found, try to get all responses and filter for partial matches
      if (!responses || responses.length === 0) {
        console.log(`No exact matches for ${label} in Supabase, trying partial matches`);
        const allResponses = await supabaseService.getAllFormResponses();

        // Filter for responses where label includes the search term or vice versa
        responses = allResponses.filter(response => {
          if (!response.label) return false;
          return response.label.toLowerCase().includes(label.toLowerCase()) || 
                 label.toLowerCase().includes(response.label.toLowerCase());
        });

        console.log(`Found ${responses.length} partial matches in Supabase`);
      }

      // Map responses to a more user-friendly format
      const formattedResponses = responses.map(response => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || new Date().toISOString(),
        responses: response.response_data || {}
      }));

      return res.status(200).json({
        success: true,
        source: 'supabase',
        formLabel: label,
        data: formattedResponses
      });
    } catch (supabaseError) {
      console.error('Supabase query failed, falling back to database storage:', supabaseError);

      // Fall back to database storage
      // Try to find responses using the exact label
      let responses = await storage.getFormResponsesByLabel(label);

      // If no responses found, try a partial match
      if (!responses || responses.length === 0) {
        console.log(`No exact matches for ${label} in database, trying partial matches`);
        // Get all responses and filter client-side for partial matches
        const allResponses = await storage.getFormResponses();

        // Filter for responses where label includes the search term or vice versa
        responses = allResponses.filter(response => {
          if (!response.label) return false;
          return response.label.toLowerCase().includes(label.toLowerCase()) || 
                 label.toLowerCase().includes(response.label.toLowerCase());
        });

        console.log(`Found ${responses.length} partial matches in database`);
      }

      // Map responses to a more user-friendly format
      const formattedResponses = responses.map(response => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || new Date().toISOString(),
        responses: response.response || {}
      }));

      return res.status(200).json({
        success: true,
        source: 'database',
        formLabel: label,
        data: formattedResponses
      });
    }
  } catch (error) {
    console.error(`Error fetching responses for form ${req.params.label}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch form responses"
    });
  }
});

// Get all form configurations
router.get("/forms", requireAdmin, async (_req: Request, res: Response) => {
  try {
    // Try Supabase first
    try {
      console.log('Attempting to get form configurations from Supabase...');
      const forms = await supabaseService.getAllFormConfigs();

      // Map forms to a more user-friendly format
      const formattedForms = forms.map(form => ({
        id: form.id,
        label: form.label || "Unnamed Form",
        createdAt: form.created_at || new Date().toISOString(),
        config: form.config
      }));

      return res.status(200).json({
        success: true,
        source: 'supabase',
        data: formattedForms
      });
    } catch (supabaseError) {
      console.error('Supabase query failed, falling back to database storage:', supabaseError);

      // Fallback to database storage
      const forms = await storage.getFormConfigs();

      // Map forms to a more user-friendly format
      const formattedForms = forms.map(form => ({
        id: form.id,
        label: form.label || "Unnamed Form",
        createdAt: form.created_at || new Date().toISOString(),
        config: form.config
      }));

      return res.status(200).json({
        success: true,
        source: 'database',
        data: formattedForms
      });
    }
  } catch (error) {
    console.error("Error fetching form configurations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch form configurations"
    });
  }
});

export default router;