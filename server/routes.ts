import type { Express } from "express";
import fs from 'fs'
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateFormFromPrompt, editJsonWithLLM } from "./services/gemini";
import { generateIconsFromOptions } from "./services/icons";
import {
  insertFormConfigSchema,
  insertFormResponseSchema,
} from "@shared/schema";
import adminRoutes from "./admin";
import authRoutes from "./auth";
import { FormConfig } from "@shared/types";
import { apiKeyAuthMiddleware } from "./services/api-key";
import { deleteFormConfig, createFormConfig } from "./services/supabase";
import Stripe from "stripe";
import { getOrCreateApiKeyForUser } from "./services/api-key";
import * as supabaseService from "./services/supabase";
import { Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import multer from "multer";
import mammoth from "mammoth";
import path from "path";
import { parsePdf } from "./services/pdf-parser";
import { uploadDocumentToStorage } from "./services/supabase-storage";
import { sendFormResponseEmail } from "./services/email";
import { analyzeDocument, DocumentAnalysisRequest } from "./services/document-analyzer";
import { executeConsoleActions } from "./console-functions/executor";
import { executeFormConfigFunctions } from "./console-functions/executor";
import { fileLogger } from "./services/file-logger";

const promptSchema = z.object({
  prompt: z.string().min(1),
});

const publishSchema = z.object({
  originalFormId: z.coerce.number().nullable().optional(),
  label: z.string().min(1),
  config: z.object({}).passthrough(),
  language: z.string().default("en"),
  promptHistory: z.array(z.string()).optional(),
  iconMode: z.enum(['lucide', 'emoji', 'none']).optional(),
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper functions for processing conditions


export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to check session state
  app.get("/api/debug/session", (req, res) => {
    res.json({
      sessionID: req.sessionID,
      session: req.session,
      user: req.session.user || null,
    });
  });

  // Temporary API key generation endpoint
  app.get("/api/dev/generate-api-key", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No user session found" });
      }

      const apiKey = await getOrCreateApiKeyForUser(userId);
      return res.json({ apiKey });
    } catch (err) {
      console.error("Error generating API key:", err);
      return res.status(500).json({ error: "Failed to generate API key" });
    }
  });

  // Get user credits - THIS IS THE CRITICAL ENDPOINT FOR YOUR CREDITS
  app.get("/api/user/credits", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await supabaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        credits: user.credits || 0,
      });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      return res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  // Create Stripe checkout session for purchasing credits
  app.post("/api/purchase-credits", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const creditPackages = {
        starter: { credits: 10, price: 5, name: "Starter" },
        pro: { credits: 25, price: 10, name: "Pro" },
        premium: { credits: 80, price: 20, name: "Premium" },
      };

      const { package: packageId } = req.body;
      const selectedPackage =
        creditPackages[packageId as keyof typeof creditPackages];

      if (!selectedPackage) {
        return res.status(400).json({ error: "Invalid package selected" });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-06-30.basil",
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${selectedPackage.name} Credits Package`,
                description: `${selectedPackage.credits} form creation credits`,
              },
              unit_amount: selectedPackage.price * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/dashboard?payment=success`,
        cancel_url: `${req.protocol}://${req.get("host")}/dashboard?payment=cancelled`,
        metadata: {
          userId,
          credits: selectedPackage.credits.toString(),
          package: packageId,
        },
      });

      return res.json({ sessionId: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return res
        .status(500)
        .json({ error: "Failed to create checkout session" });
    }
  });

  // Icons endpoint
  app.post("/api/icons", async (req, res) => {
    try {
      const { options } = req.body;

      if (!Array.isArray(options)) {
        return res.status(400).json({ error: "optionTitles must be an array" });
      }

      const { generateIconsFromOptions } = await import("./services/icons");
      const icons = await generateIconsFromOptions(options);

      return res.json({ icons });
    } catch (error) {
      console.error("Error generating icons:", error);
      return res.status(500).json({ error: "Failed to generate icons" });
    }
  });

  // Register admin routes
  app.use("/api/admin", adminRoutes);

  // Register auth routes
  app.use("/api/auth", authRoutes);

  // Get responses for a specific form by form ID
  app.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const responses = await supabaseService.getFormResponsesByFormId(formId);
      return res.json(responses);
    } catch (error) {
      console.error("Error fetching form responses:", error);
      return res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Get all forms for the current user
  app.get("/api/forms", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const forms = await supabaseService.getUserFormConfigs(userId);
      return res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      return res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  // Delete a form
  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const success = await supabaseService.deleteFormConfig(formId);
      if (!success) {
        return res
          .status(404)
          .json({ error: "Form not found or could not be deleted" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting form:", error);
      return res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Generate icons for form options
  app.post("/api/icons", async (req, res) => {
    try {
      const { optionTitles } = req.body;

      if (!Array.isArray(optionTitles)) {
        return res.status(400).json({ error: "optionTitles must be an array" });
      }

      const icons = await generateIconsFromOptions(optionTitles);
      return res.json({ icons });
    } catch (err: any) {
      console.error("Error in /api/icons:", err);
      return res.status(500).json({ error: err.message || "Internal error" });
    }
  });

  // Frontend form generation endpoint (used by dashboard)
  app.post("/api/prompt", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check user credits using Supabase
      const user = await supabaseService.getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0,
        });
      }

      const validatedData = promptSchema.parse(req.body);
      const result = await generateFormFromPrompt(validatedData.prompt);

      if (!result.config) {
        return res.status(500).json({ error: "Failed to generate form" });
      }

      // Save the form to Supabase
      const label = `Generated Form ${new Date().toLocaleDateString()}`;
      const savedFormId = await supabaseService.createFormConfig(
        label,
        result.config,
        "en",
        null,
        userId,
      );

      // Deduct credit after successful generation
      await supabaseService.deductUserCredits(userId!, 1);

      // Log the final JSON configuration being sent to frontend
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND ===");
      console.log(JSON.stringify({ id: savedFormId, config: result.config }, null, 2));
      console.log("=== END FORM CONFIGURATION ===");

      // Return form data with optional error information if fallback was used
      return res.json({ 
        id: savedFormId, 
        config: result.config,
        error: result.error,
        fallbackReason: result.fallbackReason,
        usedFallback: !!result.error
      });
    } catch (error: any) {
      console.error("Error generating form:", error);
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to generate form" });
    }
  });

  // API key based form generation endpoint (for external API access)
  app.post("/api/generate-form", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.uuid;

      // Check user credits using Supabase
      const user = await supabaseService.getUserById(userId!);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0,
        });
      }

      const validatedData = promptSchema.parse(req.body);
      const formConfig = await generateFormFromPrompt(validatedData.prompt);

      if (!formConfig) {
        return res.status(500).json({ error: "Failed to generate form" });
      }

      await supabaseService.deductUserCredits(userId!, 1);

      // Log the final JSON configuration being sent to frontend
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND (API KEY) ===");
      console.log(JSON.stringify(formConfig, null, 2));
      console.log("=== END FORM CONFIGURATION ===");

      return res.json(formConfig);
    } catch (error: any) {
      console.error("Error generating form:", error);
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to generate form" });
    }
  });

  // API key based: Create form and return URL with specified or random domain, custom label/language
  app.post("/api/create-form-url", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.uuid;

      // Check user credits using Supabase
      const user = await supabaseService.getUserById(userId!);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0,
        });
      }

      const { prompt, domain, label, language, icon_mode } = req.body;
      
      console.log("🔍 API Request received:", {
        prompt: prompt ? `${prompt.substring(0, 50)}...` : "undefined",
        domain: domain || "undefined",
        label: label || "undefined", 
        language: language || "undefined",
        icon_mode: icon_mode || "undefined"
      });
      
      if (!prompt) {
        return res.status(400).json({ error: "Missing required field: prompt" });
      }

      // Validate language if provided
      if (language && !["en", "de"].includes(language)) {
        return res.status(400).json({ error: "Language must be either 'en' or 'de'" });
      }

      // Validate icon_mode if provided
      if (icon_mode && !["lucide", "emoji", "none"].includes(icon_mode)) {
        return res.status(400).json({ error: "icon_mode must be one of: 'lucide', 'emoji', 'none'" });
      }

      // Use provided values or defaults
      const finalLanguage = language || "en";
      const finalIconMode = icon_mode || "lucide";
      const finalDomain = domain || `domain_${Math.random().toString(36).substring(2, 8)}`;
      
      // For label, we'll use the provided label or generate one from the form title after creation
      let finalLabel = label;
      
      console.log("🎯 Processing values:", {
        originalLabel: label,
        finalLabel: finalLabel,
        finalLanguage: finalLanguage,
        finalDomain: finalDomain,
        finalIconMode: finalIconMode
      });

      // Generate form config
      const formConfig = await generateFormFromPrompt(prompt);
      if (!formConfig) {
        return res.status(500).json({ error: "Failed to generate form configuration." });
      }

      // If no label provided, generate one from the first step title
      if (!finalLabel) {
        let firstTitle = 'untitled';
        if (formConfig && Array.isArray(formConfig.steps) && formConfig.steps.length > 0 && formConfig.steps[0].title) {
          firstTitle = String(formConfig.steps[0].title).replace(/\s+/g, '_').toLowerCase();
        }
        finalLabel = firstTitle;
      }

      // Check for unique combination of language, label, and domain
      const isUnique = await supabaseService.checkUniqueFormProperties(
        finalLanguage,
        finalLabel,
        finalDomain
      );

      if (!isUnique) {
        return res.status(409).json({ 
          error: "This combination of language, label, and domain already exists. Please choose different values.",
          conflictDetails: {
            language: finalLanguage,
            label: finalLabel,
            domain: finalDomain
          }
        });
      }

      // Create form with the specified parameters
      console.log("🚀 About to create form with parameters:", {
        finalLabel: finalLabel,
        finalLanguage: finalLanguage,
        finalDomain: finalDomain,
        finalIconMode: finalIconMode
      });
      
      const formId = await supabaseService.createFormConfig(
        finalLabel, 
        formConfig, 
        finalLanguage, 
        finalDomain, 
        userId,
        finalIconMode
      );

      // Deduct credit after successful generation
      await supabaseService.deductUserCredits(userId!, 1);

      // Fetch the form to get the actual URL
      const form = await supabaseService.getFormByProperties(finalLanguage, finalLabel, finalDomain);
      if (!form) {
        return res.status(500).json({ error: "Failed to retrieve created form." });
      }

      return res.json({ 
        url: form.url,
        formId: form.id,
        language: form.language,
        label: form.label,
        domain: form.domain,
        iconMode: form.iconMode
      });
    } catch (error: any) {
      console.error("/api/create-form-url error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create form and return URL." });
    }
  });

  // API key based: Update form_console by (label, language, domain)
  app.post("/api/update-form-console", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const { label, language, domain, form_console } = req.body;
      if (!label || !language || !domain || !form_console) {
        return res.status(400).json({ error: "Missing required fields: label, language, domain, form_console" });
      }
      
      // Find the form by combination
      const form = await supabaseService.getFormByProperties(language, label, domain);
      if (!form) {
        return res.json({ success: false });
      }
      
      // Update form_console (allow partial/optional fields)
      await supabaseService.updateFormConsole(form.id, form_console);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("/api/update-form-console error:", error);
      return res.json({ success: false });
    }
  });

  // Publish a form configuration
  app.post("/api/publish", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = publishSchema.parse(req.body);
      const { originalFormId } = validatedData;
      
      console.log("🔍 PUBLISH API - Received data:", {
        originalFormId,
        label: validatedData.label,
        iconMode: validatedData.iconMode,
        hasConfig: !!validatedData.config
      });

      if (originalFormId) {
        // Update existing form
        console.log("🔄 PUBLISH API - Updating existing form:", {
          formId: originalFormId,
          iconMode: validatedData.iconMode || 'lucide'
        });
        
        await supabaseService.updateFormConfig(originalFormId, {
          config: validatedData.config,
          label: validatedData.label,
          iconMode: validatedData.iconMode || 'lucide',
        });
        
        // Return the updated form
        const updatedForm = await supabaseService.getFormConfig(originalFormId);
        console.log("✅ PUBLISH API - Updated form retrieved:", {
          formId: (updatedForm as any)?.id,
          iconMode: (updatedForm as any)?.iconMode
        });
        return res.json(updatedForm);
      } else {
        // Create new form
        const formData = {
          userId,
          label: validatedData.label,
          config: validatedData.config as FormConfig,
          language: validatedData.language,
          iconMode: validatedData.iconMode || 'lucide',
        };
        const savedForm = await storage.createFormConfig(formData);
        return res.json(savedForm);
      }
    } catch (error: any) {
      console.error("Error publishing form:", error);
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid form data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to publish form" });
    }
  });

  // Edit form with AI
  app.post("/api/edit-form", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check user credits
      const user = await supabaseService.getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to edit a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0,
        });
      }

      const { currentConfig, instruction } = req.body;

      if (!currentConfig || !instruction) {
        return res
          .status(400)
          .json({ error: "Missing currentConfig or instruction" });
      }

      const updatedConfig = await editJsonWithLLM(currentConfig, instruction);

      if (!updatedConfig) {
        return res.status(500).json({ error: "Failed to edit form" });
      }

      // Deduct credit after successful edit
      await supabaseService.deductUserCredits(userId, 1);

      // Parse the string result before sending
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(updatedConfig);
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse updated config" });
      }
      return res.json({ config: parsedConfig });
    } catch (error: any) {
      console.error("Error editing form:", error);
      return res.status(500).json({ error: "Failed to edit form" });
    }
  });

  // Update form icon mode
  app.put("/api/forms/icon-mode", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { formId, iconMode } = req.body;
      
      console.log("🎨 ICON MODE API - Received request:", {
        userId,
        formId,
        iconMode,
        body: req.body
      });
      
      if (!formId || !iconMode || !['lucide', 'emoji', 'none'].includes(iconMode)) {
        console.log("❌ ICON MODE API - Invalid request:", { formId, iconMode });
        return res.status(400).json({ error: "Invalid formId or iconMode" });
      }

      console.log("🔄 ICON MODE API - Updating form config...");
      const success = await supabaseService.updateFormConfig(formId, {
        iconMode: iconMode
      });

      console.log("✅ ICON MODE API - Update result:", { success });

      if (success) {
        return res.json({ success: true });
      } else {
        return res.status(500).json({ error: "Failed to update icon mode" });
      }
    } catch (error: any) {
      console.error("❌ ICON MODE API - Error:", error);
      return res.status(500).json({ error: "Failed to update icon mode" });
    }
  });

  // Update form properties (language, label, domain)
  app.put("/api/forms/:id/properties", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const { language, label, domain, url } = req.body;

      // Validate required fields
      if (!language || !label || !domain) {
        return res.status(400).json({ error: "Language, label, and domain are required" });
      }

      // Validate language
      if (!["en", "de"].includes(language)) {
        return res.status(400).json({ error: "Language must be either 'en' or 'de'" });
      }

      // Check if form exists and belongs to user
      const form = await supabaseService.getFormConfig(formId);
      if (!form || form.user_uuid !== userId) {
        return res.status(404).json({ error: "Form not found" });
      }

      // Check for unique combination of language, label, and domain
      const isUnique = await supabaseService.checkUniqueFormProperties(
        language,
        label,
        domain,
        formId // Exclude current form from check
      );

      if (!isUnique) {
        return res.status(409).json({ 
          error: "This combination of language, label, and domain already exists. Please choose different values." 
        });
      }

      // Update form properties
      await supabaseService.updateFormProperties(formId, {
        language,
        label,
        domain,
        url,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating form properties:", error);
      return res.status(500).json({ error: "Failed to update form properties" });
    }
  });

  // Get form by properties (language, label, domain)
  app.get("/api/forms/by-properties", async (req, res) => {
    try {
      const { language, label, domain } = req.query;

      if (!language || !label || !domain) {
        return res.status(400).json({ error: "Language, label, and domain are required" });
      }

      const form = await supabaseService.getFormByProperties(
        language as string,
        label as string,
        domain as string
      );

      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      // --- INTEGRATE AUTO-SELECT LOGIC ---
      let modifiedForm = { ...form };
      if (form.form_console) {
        try {
          console.log(`[Form Config] Running executeFormConfigFunctions for formId ${form.id} with form_console:`, JSON.stringify(form.form_console));
          modifiedForm.config = await executeFormConfigFunctions(form.config, form.form_console);
          console.log(`[Form Config] Modified form config after auto-select for formId ${form.id}:`, JSON.stringify(modifiedForm.config));
        } catch (autoSelectError) {
          console.error(`[Form Config] Error running executeFormConfigFunctions for formId ${form.id}:`, autoSelectError);
        }
      }
      // --- END AUTO-SELECT LOGIC ---

      return res.json(modifiedForm);
    } catch (error) {
      console.error("Error fetching form by properties:", error);
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  // Get a specific form by ID
  app.get("/api/forms/:id", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const form = await supabaseService.getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      // --- INTEGRATE AUTO-SELECT LOGIC ---
      let modifiedForm = { ...form };
      if (form.form_console) {
        try {
          console.log(`[Form Config] Running executeFormConfigFunctions for formId ${formId} with form_console:`, JSON.stringify(form.form_console));
          modifiedForm.config = await executeFormConfigFunctions(form.config, form.form_console);
          console.log(`[Form Config] Modified form config after auto-select for formId ${formId}:`, JSON.stringify(modifiedForm.config));
        } catch (autoSelectError) {
          console.error(`[Form Config] Error running executeFormConfigFunctions for formId ${formId}:`, autoSelectError);
        }
      }
      // --- END AUTO-SELECT LOGIC ---

      return res.json(modifiedForm);
    } catch (error) {
      console.error("Error fetching form:", error);
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  // Upload document endpoint
  app.post(
    "/api/upload-document",
    upload.single("document"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.file;
        console.log('[API] File details:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer?.length || 0
        });
        
        let extractedText = "";

        // Extract text based on file type
        try {
          if (file.mimetype === "application/pdf") {
            console.log('[API] Processing PDF file');
            const pdfData = await parsePdf(file.buffer);
            extractedText = pdfData.text;
            console.log('[API] PDF text extracted, length:', extractedText.length);
          } else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            console.log('[API] Processing Word document');
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
            console.log('[API] Word document text extracted, length:', extractedText.length);
          } else if (file.mimetype === "text/plain") {
            console.log('[API] Processing text file');
            extractedText = file.buffer.toString("utf-8");
            console.log('[API] Text file content extracted, length:', extractedText.length);
          } else if (file.mimetype.startsWith("image/")) {
            console.log('[API] Processing image file - no text extraction');
            // For images, we don't extract text, just store the URL
            extractedText = ""; // No text content for images
          } else {
            return res.status(400).json({ 
              error: "Unsupported file type. Please upload a PDF, Word document, text file, or image (PNG, JPG, JPEG)." 
            });
          }
        } catch (textExtractionError) {
          console.error("Error extracting text from document:", textExtractionError);
          if (textExtractionError instanceof Error) {
            return res.status(400).json({ 
              error: textExtractionError.message 
            });
          }
          return res.status(500).json({ 
            error: "Failed to extract text from the document" 
          });
        }

        // Upload document to Supabase Storage
        const documentUrl = await uploadDocumentToStorage(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        console.log('[API] Document uploaded and processed:', {
          fileName: file.originalname,
          fileSize: file.size,
          documentUrl: documentUrl,
          extractedTextLength: extractedText.length,
        });

        const responseData = {
          documentUrl: documentUrl,
          extractedText: extractedText,
        };
        
        console.log('[API] Final response data being sent:', responseData);
        return res.json(responseData);
      } catch (error) {
        console.error("Error processing document:", error);
        if (error instanceof Error) {
          return res.status(500).json({ 
            error: `Failed to process document: ${error.message}` 
          });
        }
        return res.status(500).json({ error: "Failed to process document" });
      }
    },
  );

  // Create new form session for temporary response tracking
  app.post("/api/forms/:id/session", async (req, res) => {
    console.log("[Session] NEW session creation requested");
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      // Get the form to validate it exists and get metadata
      const form = await supabaseService.getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      // Always create a new session for each form interaction
      // This ensures no data contamination between different users/sessions
      const sessionNo = await supabaseService.getNextSessionNumber(formId);
      const sessionId = await supabaseService.createFormSession(formId, sessionNo, {
        label: form.label,
        language: form.language || "en",
        domain: form.domain,
        userUuid: form.user_uuid
      });

      console.log(`[Session] Created NEW session ${sessionNo} for form ${formId} with ID ${sessionId}`);
      return res.json({
        sessionId,
        sessionNo,
        tempResponse: {}
      });

    } catch (error: any) {
      console.error("[Session] Error creating new session:", error);
      return res.status(500).json({ error: error.message || "Failed to create session" });
    }
  });

  // Update temporary response for a session
  app.patch("/api/sessions/:sessionId/temp-response", async (req, res) => {
    console.log("[Session] Temp response update requested");
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }

      const { tempResponse } = req.body;
      if (!tempResponse || typeof tempResponse !== 'object') {
        return res.status(400).json({ error: "Invalid temp response data" });
      }

      await supabaseService.updateTempResponse(sessionId, tempResponse);
      console.log(`[Session] Updated temp response for session ${sessionId}`);
      
      return res.json({ success: true });

    } catch (error: any) {
      console.error("[Session] Error updating temp response:", error);
      return res.status(500).json({ error: error.message || "Failed to update temp response" });
    }
  });

  // Submit a form response
  app.post("/api/forms/:id/submit", async (req, res) => {
    console.log("[Form Submission] Form submission received");
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      // Get the form to validate it exists and get label
      const form = await supabaseService.getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      console.log(`[Form Submission] Loaded form config for formId ${formId}: label=${form.label}`);
      if (form.form_console) {
        console.log(`[Form Submission] Loaded form_console config for formId ${formId}:`, JSON.stringify(form.form_console));
      } else {
        console.log(`[Form Submission] No form_console config found for formId ${formId}`);
      }

      // Extract session info from request body
      const { _sessionInfo, ...formResponses } = req.body;
      const sessionId = _sessionInfo?.sessionId;
      const sessionNo = _sessionInfo?.sessionNo;
      
      console.log(`[Form Submission] Session info received: sessionId=${sessionId}, sessionNo=${sessionNo}`);

      let savedResponseId: number;

      // If we have session info, try to complete the existing session
      if (sessionId && sessionNo) {
        console.log(`[Form Submission] Attempting to complete existing session ${sessionId}`);
        const success = await supabaseService.completeFormSession(sessionId, formResponses);
        
        if (success) {
          console.log(`[Form Submission] Successfully completed session ${sessionId}`);
          savedResponseId = sessionId; // Use the existing session ID
        } else {
          console.log(`[Form Submission] Failed to complete session ${sessionId}, creating new response`);
          // Fallback: create new response if session completion fails
          savedResponseId = await supabaseService.createFormResponse(
            form.label,
            formResponses,
            form.language || "en",
            form.domain || null,
            formId,
            form.user_uuid || null,
          );
        }
      } else {
        console.log(`[Form Submission] No session info provided, creating new response`);
        // No session info, create new response (legacy behavior)
        savedResponseId = await supabaseService.createFormResponse(
          form.label,
          formResponses,
          form.language || "en",
          form.domain || null,
          formId,
          form.user_uuid || null,
        );
      }

      console.log(`[Form Submission] Form response saved with ID ${savedResponseId} for formId ${formId}`);

//COMMENTING OUT THE EMAIL SENDING FOR NOW 

//       // --- INTEGRATE CONSOLE FUNCTION EXECUTION ---
//       try {
//         console.log(`[Form Submission] Executing console functions for formId ${formId}...`);
//         await executeConsoleActions(formId, formResponses, form.label);
//         console.log(`[Form Submission] Console functions executed for formId ${formId}`);
//       } catch (consoleError) {
//         console.error(`[Form Submission] Error executing console functions for formId ${formId}:`, consoleError);
//       }
//       // --- END INTEGRATION ---

//       // Send email notification if user provided an email
//       try {
//         // Look for email in the response data (common field names)
//         // const userEmail = formResponses.email || formResponses.Email || formResponses.emailAddress || 
//         //                  formResponses['Email Address'] || formResponses['email_address'] ||
//         //                  formResponses.contact?.email || formResponses.Contact?.email ||
//         //                  formResponses['Your Contact Information 📧']?.email;
//         console.log("email loop entered");
// /////////////CHANGEDLOCAL        
//         fileLogger.log('form-submission', `Form submission data: ${JSON.stringify(formResponses)}`);

//         const keys = Object.keys(formResponses);
//         const lastKey = keys[keys.length - 1];
//         const userEmail = formResponses[lastKey]?.email;
// ////////////CHANGEDLOCAL
//         if (userEmail && form.user_uuid) {
//           // Get form creator's email
//           console.log("email exists")
//           const formCreator = await supabaseService.getUserById(form.user_uuid);
//           if (formCreator && formCreator.email) {
//             await sendFormResponseEmail(
//               formCreator.email,
//               userEmail,
//               form.label,
//               formResponses
//             );
//             console.log(`email sent to ${userEmail} for form , this is route proof`)
//           }
//         }
//       } catch (emailError) {
//         console.error('Failed to send confirmation email:', emailError);
//         // Don't fail the form submission if email fails
//       }

      return res.json({ success: true, id: savedResponseId });
    } catch (error: any) {
      console.error("Error submitting form response:", error);

      // Ensure we always return JSON, never HTML
      const errorMessage = error?.message || "Failed to submit response";
      return res.status(500).json({
        error: errorMessage,
        success: false,
      });
    }
  });

  // Save quotation template endpoint
  app.post('/api/quotation-template', async (req, res) => {
    try {
      const { template, formId } = req.body;
      const userId = req.session.user?.supabaseUserId;

      if (!template || !formId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Template and formId are required' 
        });
      }

      // Save template to database or session storage
      // For now, we'll store it in session for simplicity
      if (!req.session.quotationTemplates) {
        req.session.quotationTemplates = {};
      }
      req.session.quotationTemplates[formId] = template;

      res.json({ 
        success: true, 
        message: 'Quotation template saved successfully' 
      });
    } catch (error) {
      console.error('Error saving quotation template:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save quotation template' 
      });
    }
  });

  // Get quotation template endpoint
  app.get('/api/quotation-template/:formId', async (req, res) => {
    try {
      const { formId } = req.params;
      const userId = req.session.user?.supabaseUserId;

      const template = req.session.quotationTemplates?.[formId] || '';

      res.json({ 
        success: true, 
        template 
      });
    } catch (error) {
      console.error('Error retrieving quotation template:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to retrieve quotation template' 
      });
    }
  });

      // Generate document analysis using AI agent
    app.post("/api/generate-quotation", async (req, res) => {
      try {
        const { formResponses, documentData, contentPrompt, formId } = req.body;
        const stepTitle = Object.keys(documentData).find(key => key.toLowerCase().includes('document info') || key.toLowerCase().includes('analyzing your document')) || 'Document Information';
        console.log('[API] /api/generate-quotation called with:', { 
          formResponses, 
          documentData, 
          contentPrompt, 
          formId, 
          stepTitle 
        });
        console.log('[API] Full documentData object:', JSON.stringify(documentData, null, 2));
        console.log('[API] Full formResponses object:', JSON.stringify(formResponses, null, 2));
      
      // Determine if the document is an image
      const isImage = documentData.documentUrl && (
        documentData.documentUrl.includes('.png') || 
        documentData.documentUrl.includes('.jpg') || 
        documentData.documentUrl.includes('.jpeg')
      );
      console.log('[API] Document type detection:', { 
        isImage, 
        documentUrl: documentData.documentUrl,
        hasDocumentContent: !!documentData.documentContent,
        documentContentLength: documentData.documentContent?.length || 0
      });
      
      // Use Gemini agent to analyze document
      const analysisResult = await analyzeDocument({
        formResponses,
        documentContent: documentData.documentContent,
        documentUrl: documentData.documentUrl,
        question: contentPrompt,
        isImage
      });
      
      console.log('[API] Gemini document analysis result:', analysisResult);
      console.log('[API] Analysis result details:', {
        success: analysisResult.success,
        answerLength: analysisResult.answer?.length || 0,
        answerPreview: analysisResult.answer?.substring(0, 200) + '...',
        error: analysisResult.error
      });
      
      // Save the generated analysis in Supabase under the step title key
      if (formId) {
        // Fetch the latest form response for this formId
        const responses = await supabaseService.getFormResponsesByFormId(formId);
        const latestResponse = responses && responses.length > 0 ? responses[0] : null;
        if (latestResponse) {
          console.log('[API] Found existing response:', {
            responseId: latestResponse.id,
            responseKeys: Object.keys(latestResponse.response || {}),
            currentStepValue: latestResponse.response?.[stepTitle]
          });
          
          // Update the response object with the new analysis under the step title
          const updatedResponse = {
            ...latestResponse.response,
            [stepTitle]: analysisResult.answer || 'Failed to analyze document.'
          };
          console.log('[API] Updated response object:', {
            newStepValue: updatedResponse[stepTitle],
            allKeys: Object.keys(updatedResponse)
          });
          
          // Save the updated response back to Supabase
          await supabaseService.createFormResponse(
            latestResponse.label,
            updatedResponse,
            latestResponse.language,
            latestResponse.domain,
            formId,
            latestResponse.user_uuid || null
          );
          console.log('[API] Document analysis saved in Supabase for formId', formId, 'under key', stepTitle);
        } else {
          console.warn('[API] No existing form response found for formId', formId, '. Skipping Supabase save.');
        }
      } else {
        console.warn('[API] No formId provided. Skipping Supabase save.');
      }
      
      console.log('[API] Final response being sent to frontend:', { quotation: analysisResult.answer });
      res.json({ quotation: analysisResult.answer });
    } catch (error) {
      console.error('[API] Error analyzing document:', error);
      res.status(500).json({ quotation: 'An error occurred while analyzing the document.' });
    }
  });

  // Console Functions API endpoints
  
  // Get console configuration for a form
  app.get("/api/console/:formId", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const userId = req.session.user?.supabaseUserId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const form = await supabaseService.getFormConfig(formId);
      
      if (!form || form.user_uuid !== userId) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      res.json({
        formId: form.id,
        formLabel: form.label,
        consoleConfig: form.form_console || {}
      });
    } catch (error) {
      console.error("Error fetching console config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Update console configuration for a form
  app.put("/api/console/:formId", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const userId = req.session.user?.supabaseUserId;
      const { consoleConfig } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify form ownership
      const form = await supabaseService.getFormConfig(formId);
      
      if (!form || form.user_uuid !== userId) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Update the console configuration
      await supabaseService.updateFormConsole(formId, consoleConfig);
      
      res.json({ success: true, message: "Console configuration updated" });
    } catch (error) {
      console.error("Error updating console config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // These endpoints are no longer needed with the new console structure
  // The new structure uses direct configuration rather than AI-processed conditions

  // Proxy for Google Maps Geocoding API to avoid CORS issues
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Missing or invalid address" });
      }
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured on server" });
      }
      const fetch = (await import("node-fetch")).default;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/geocode proxy:", error);
      res.status(500).json({ error: "Failed to fetch geocode data" });
    }
  });

  // Proxy for Google Maps Static Maps API to avoid exposing API key
  app.get("/api/staticmap", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured on server" });
      }
      // Build the Google Static Maps API URL with all query params from the request
      const params = new URLSearchParams(req.query as any);
      params.set("key", apiKey);
      const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch static map image" });
      }
      res.set("Content-Type", "image/png");
      response.body.pipe(res);
    } catch (error) {
      console.error("Error in /api/staticmap proxy:", error);
      res.status(500).json({ error: "Failed to fetch static map image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}