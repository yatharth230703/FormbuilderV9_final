var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/icons.ts
var icons_exports = {};
__export(icons_exports, {
  generateIconsFromOptions: () => generateIconsFromOptions
});
import dotenv2 from "dotenv";
async function generateIconsFromOptions(optionTitles) {
  const prompt = `
You are an icon-selection engine for Lucide React icons.
Given this array of option titles:
${JSON.stringify(optionTitles)}

Available Lucide icons to choose from:
${JSON.stringify(LUCIDE_ICONS)}

Return ONLY a JSON array of icon names (strings) of the same length,
where each icon semantically matches the corresponding title.
Only use icons from the provided list. If no perfect match exists, choose the closest semantic match.

Example input: ["Home Page", "Contact Us", "About", "Services"]
Example output: ["Home", "Mail", "Users", "Settings"]
  `.trim();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 256
        }
      })
    });
    if (!res.ok) {
      console.error("Icon API error:", await res.text());
      throw new Error("Failed to generate icons");
    }
    const payload = await res.json();
    const text2 = payload.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = text2.match(/\[[\s\S]*?\]/);
    if (!match) {
      throw new Error("Invalid icon response format");
    }
    let icons = JSON.parse(match[0]);
    icons = icons.map((icon, index) => {
      if (typeof icon !== "string" || !LUCIDE_ICONS.includes(icon)) {
        console.warn(`Invalid icon "${icon}" for "${optionTitles[index]}", using fallback`);
        return getDefaultIconForTitle(optionTitles[index]);
      }
      return icon;
    });
    while (icons.length < optionTitles.length) {
      icons.push("Circle");
    }
    return icons.slice(0, optionTitles.length);
  } catch (error) {
    console.error("Error generating icons:", error);
    return optionTitles.map((title) => getDefaultIconForTitle(title));
  }
}
function getDefaultIconForTitle(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("home") || titleLower.includes("house")) return "Home";
  if (titleLower.includes("user") || titleLower.includes("profile") || titleLower.includes("account")) return "User";
  if (titleLower.includes("mail") || titleLower.includes("email") || titleLower.includes("contact")) return "Mail";
  if (titleLower.includes("phone") || titleLower.includes("call")) return "Phone";
  if (titleLower.includes("location") || titleLower.includes("address") || titleLower.includes("map")) return "MapPin";
  if (titleLower.includes("time") || titleLower.includes("schedule")) return "Clock";
  if (titleLower.includes("date") || titleLower.includes("calendar")) return "Calendar";
  if (titleLower.includes("heart") || titleLower.includes("love") || titleLower.includes("like")) return "Heart";
  if (titleLower.includes("star") || titleLower.includes("rating") || titleLower.includes("review")) return "Star";
  if (titleLower.includes("message") || titleLower.includes("chat") || titleLower.includes("comment")) return "MessageSquare";
  if (titleLower.includes("check") || titleLower.includes("yes") || titleLower.includes("confirm")) return "CheckCircle";
  if (titleLower.includes("settings") || titleLower.includes("config") || titleLower.includes("options")) return "Settings";
  if (titleLower.includes("search") || titleLower.includes("find")) return "Search";
  if (titleLower.includes("food") || titleLower.includes("restaurant") || titleLower.includes("eat")) return "Utensils";
  if (titleLower.includes("money") || titleLower.includes("price") || titleLower.includes("cost")) return "DollarSign";
  if (titleLower.includes("shop") || titleLower.includes("buy") || titleLower.includes("purchase")) return "ShoppingCart";
  if (titleLower.includes("help") || titleLower.includes("support") || titleLower.includes("question")) return "Info";
  if (titleLower.includes("work") || titleLower.includes("job") || titleLower.includes("career")) return "Briefcase";
  if (titleLower.includes("book") || titleLower.includes("read") || titleLower.includes("education")) return "Book";
  if (titleLower.includes("music") || titleLower.includes("audio") || titleLower.includes("sound")) return "Music";
  if (titleLower.includes("video") || titleLower.includes("watch") || titleLower.includes("film")) return "Video";
  if (titleLower.includes("image") || titleLower.includes("photo") || titleLower.includes("picture")) return "Image";
  return "Circle";
}
var LUCIDE_ICONS, GEMINI_API_KEY;
var init_icons = __esm({
  "server/services/icons.ts"() {
    "use strict";
    dotenv2.config();
    LUCIDE_ICONS = [
      "Home",
      "User",
      "Mail",
      "Phone",
      "MapPin",
      "Calendar",
      "Clock",
      "Heart",
      "Star",
      "ThumbsUp",
      "MessageSquare",
      "CheckCircle",
      "XCircle",
      "AlertTriangle",
      "Info",
      "Settings",
      "Search",
      "Filter",
      "Plus",
      "Minus",
      "Edit",
      "Trash2",
      "Download",
      "Upload",
      "Share",
      "Copy",
      "Link",
      "External-link",
      "ArrowRight",
      "ArrowLeft",
      "ChevronDown",
      "ChevronUp",
      "Menu",
      "X",
      "Eye",
      "EyeOff",
      "Lock",
      "Unlock",
      "Shield",
      "Key",
      "CreditCard",
      "DollarSign",
      "ShoppingCart",
      "ShoppingBag",
      "Gift",
      "Package",
      "Truck",
      "Plane",
      "Car",
      "Bike",
      "Train",
      "Globe",
      "Wifi",
      "Bluetooth",
      "Battery",
      "Volume2",
      "VolumeX",
      "Camera",
      "Image",
      "Video",
      "Music",
      "Headphones",
      "Mic",
      "Speaker",
      "Monitor",
      "Smartphone",
      "Tablet",
      "Laptop",
      "Printer",
      "HardDrive",
      "Folder",
      "File",
      "FileText",
      "Book",
      "Bookmark",
      "Library",
      "GraduationCap",
      "Users",
      "UserPlus",
      "Crown",
      "Award",
      "Medal",
      "Trophy",
      "Target",
      "Flag",
      "Zap",
      "Sun",
      "Moon",
      "Cloud",
      "CloudRain",
      "Snowflake",
      "Thermometer",
      "Droplets",
      "Wind",
      "Mountain",
      "Tree",
      "Flower",
      "Leaf",
      "Apple",
      "Coffee",
      "Pizza",
      "Utensils",
      "ChefHat",
      "Wine",
      "Beer",
      "IceCream",
      "Candy",
      "Cake",
      "Restaurant",
      "Store",
      "Building",
      "Factory",
      "Hospital",
      "School",
      "Church",
      "Bank",
      "Hotel",
      "Gamepad2",
      "Dices",
      "Puzzle",
      "Paintbrush",
      "Palette",
      "Brush",
      "Scissors",
      "Ruler",
      "Calculator",
      "Briefcase",
      "Hammer",
      "Wrench",
      "Screwdriver",
      "Drill",
      "Saw",
      "HardHat",
      "Stethoscope",
      "Pill",
      "Syringe",
      "Bandage",
      "FirstAid",
      "Accessibility",
      "Baby",
      "Dog",
      "Cat",
      "Fish",
      "Bird",
      "Bug",
      "Butterfly",
      "Rabbit",
      "Turtle"
    ];
    GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  formConfig: () => formConfig,
  formConfigRelations: () => formConfigRelations,
  formResponses: () => formResponses,
  formResponsesRelations: () => formResponsesRelations,
  insertFormConfigSchema: () => insertFormConfigSchema,
  insertFormResponseSchema: () => insertFormResponseSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  uuid: text("uuid").unique(),
  // This is the Supabase auth user ID
  api_key: text("api_key").unique().default(null),
  credits: text("credits")
  // Adding credits column from migration
});
var usersRelations = relations(users, ({ many }) => ({
  formConfigs: many(formConfig)
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
  uuid: true,
  credits: true
}).extend({
  uuid: z.string().optional(),
  email: z.string().email(),
  isAdmin: z.boolean().optional()
});
var formConfig = pgTable("form_config", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  config: json("config"),
  domain: text("domain"),
  user_uuid: text("user_uuid").references(() => users.id),
  // Renamed to match RLS policies
  form_console: json("form_console").default("{}")
});
var formConfigRelations = relations(formConfig, ({ one, many }) => ({
  user: one(users, {
    fields: [formConfig.user_uuid],
    references: [users.id]
  }),
  responses: many(formResponses)
}));
var insertFormConfigSchema = createInsertSchema(formConfig).pick({
  label: true,
  language: true,
  config: true,
  domain: true,
  user_uuid: true,
  form_console: true
});
var formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  response: json("response"),
  domain: text("domain"),
  form_config_id: integer("form_config_id").references(() => formConfig.id),
  user_uuid: text("user_uuid")
  // Add user_uuid to link responses to users
});
var formResponsesRelations = relations(formResponses, ({ one }) => ({
  formConfig: one(formConfig, {
    fields: [formResponses.form_config_id],
    references: [formConfig.id]
  })
}));
var insertFormResponseSchema = createInsertSchema(formResponses).pick({
  label: true,
  language: true,
  response: true,
  domain: true,
  form_config_id: true,
  user_uuid: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// server/vite.ts
import path2 from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});

// server/vite.ts
import { createLogger } from "vite";
var viteLogger = createLogger();
function log(message, source = "express") {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  console.log(`[${timestamp2}] [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  const indexPath = path2.resolve(distPath, "index.html");
  log(`Serving static files from: ${distPath}`);
  if (!fs.existsSync(distPath)) {
    log("Build files not found! Please run 'npm run build' first", "static");
    process.exit(1);
  }
  if (!fs.existsSync(indexPath)) {
    log("index.html not found in build directory!", "static");
    process.exit(1);
  }
  app2.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, path3) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (path3.endsWith(".js") || path3.endsWith(".css")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (path3.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    }
  }));
  app2.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not Found" });
    }
    try {
      const indexHtml = fs.readFileSync(indexPath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (error) {
      log(`Error serving index.html: ${error}`, "static");
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  log("Static file serving configured for production", "static");
}

// server/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var connectionString = process.env.DATABASE_URL || "";
if (!connectionString) {
  log("DATABASE_URL is not set. Database features will not function properly.", "db");
}
var client = postgres(connectionString, { max: 1 });
var db = drizzle(client, { schema: schema_exports });
var pool = new Pool({
  connectionString
});

// server/storage.ts
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "session",
      // Table name for storing sessions
      createTableIfMissing: true
      // Create table if it doesn't exist
    });
    console.log("PostgreSQL session store initialized");
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }
  async createFormConfig(insertConfig) {
    const [config] = await db.insert(formConfig).values(insertConfig).returning();
    return config;
  }
  async getFormConfig(id) {
    const [config] = await db.select().from(formConfig).where(eq(formConfig.id, id));
    return config;
  }
  async getFormConfigs() {
    return await db.select().from(formConfig);
  }
  async getUserFormConfigs(userId) {
    return await db.select().from(formConfig).where(eq(formConfig.user_uuid, userId));
  }
  async createFormResponse(insertResponse) {
    const [response] = await db.insert(formResponses).values(insertResponse).returning();
    return response;
  }
  async getFormResponses() {
    return await db.select().from(formResponses);
  }
  async getFormResponsesByLabel(label) {
    return await db.select().from(formResponses).where(eq(formResponses.label, label));
  }
  async getFormResponsesByFormId(formId) {
    return await db.select().from(formResponses).where(eq(formResponses.form_config_id, formId));
  }
  async deleteFormConfig(id) {
    try {
      const result = await db.delete(formConfig).where(eq(formConfig.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting form config with ID ${id}:`, error);
      return false;
    }
  }
  // Credit management functions
  async getUserById(uuid) {
    try {
      const results = await db.select().from(users).where(eq(users.uuid, uuid)).limit(1);
      return results[0] || null;
    } catch (error) {
      console.error("Error fetching user by UUID:", error);
      return null;
    }
  }
  async addUserCredits(userId, credits) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const currentCredits = parseInt(user.credits || "0", 10);
      const newCredits = currentCredits + credits;
      await db.update(users).set({ credits: newCredits.toString() }).where(eq(users.uuid, userId));
      console.log(`Added ${credits} credits to user ${userId}. New total: ${newCredits}`);
    } catch (error) {
      console.error("Error adding credits to user:", error);
      throw error;
    }
  }
  async deductUserCredits(userId, credits) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const currentCredits = parseInt(user.credits || "0", 10);
      if (currentCredits < credits) {
        throw new Error("Insufficient credits");
      }
      const newCredits = currentCredits - credits;
      await db.update(users).set({ credits: newCredits.toString() }).where(eq(users.uuid, userId));
      console.log(`Deducted ${credits} credits from user ${userId}. New total: ${newCredits}`);
    } catch (error) {
      console.error("Error deducting credits from user:", error);
      throw error;
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z4 } from "zod";

// server/services/gemini.ts
init_icons();
import dotenv3 from "dotenv";
dotenv3.config();
var GEMINI_API_KEY2 = process.env.GEMINI_API_KEY || "";
var GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
var SYSTEM_PROMPT = `You are a form generation engine that creates multi-step forms based on given prompts.
Output ONLY valid JSON without any explanation or extra text.
Make sure you extract all keywords from the prompt and include relevant questions that address the user's specific needs. If in the given prompt you feel the need to add a document upload step , add it .This can usually be deduced by looking for keywords like 'upload document' or 'try our service' or 'get a quote'.

CRITICAL RULES FOR TITLES AND QUESTIONS:
1. Each title and subtitle MUST be unique across all steps, and should never be untitled. It should hold significance.
2. Never repeat the same question in different formats
3. Avoid semantically similar questions (e.g., "What's your budget?" vs "How much can you spend?")
4. Use distinct icons for each step
5. Ensure each option within tiles/multiSelect steps has a unique title
6. Make each step focus on a distinct aspect of information gathering
7. Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
8. Always make sure whenever a document upload step is added , a document info step is added right after it. So if the document upload step is at index 3 , the document info step should be at index 4.
9. If and only if there is a document upload step involved,  make sure that the previous steps are asking questions / contain content that is relevant to the document upload step and the document that needs to be uploaded. Let us say for example , if the document upload step is asking for a resume , make sure that the previous steps are asking questions like 'What is your current job title?' , 'What is your current company?' etc. Or if the document upload step is asking for a business plan , make sure that the previous steps are asking questions like 'What is your business idea?' , 'What is your business model?' etc.
10. Please make sure that the steps before the document upload step are the only ones that ask document upload related questions, rest can be generic based on prompt.
11. Always check if a number/amount of slides or questions is given. If so , generate the exact amount of slides asked , else generate about 7-8 slides.


The following form configuration is to be used as a reference for any configs that you generate. Focus largely on structure and keynames, values are placeholders:

{
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a",
      },
      primary: "#0E565B",
      background: {
        light: "#ffffff",
        white: "#ffffff",
      },
    },
  },
  steps: [
    {
      type: "tiles",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "id_1",
          title: "Title_1",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_4",
          title: "Title_4",
          description: "Extremely Short Description",
          icon: "",
        },
      ],
    },
    {
      type: "multiSelect",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "id_1",
          title: "Title_1",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_4",
          title: "Tite_4",
          description: "Extremely Short Description",
          icon: "",
        },
      ],
    },
    {
      type: "slider",
      title: "Title Name",
      subtitle: "Subtitle Name",
      min: min_val,
      max: max_val,
      step: step_for_slider_val,
      defaultValue: default_val,
      prefix: "",
    },
    {
      type: "textbox",
      title: "Title Name",
      subtitle: "Subtitle Name",
      placeholder: "Placeholder content",
      rows: num_rows,
      validation: {
        required: true,
        minLength: 20,
      },
    },
    {
      type: "location",
      title: "Where are you located?",
      subtitle: "Please enter your location to check service availability",
      config: {
        labels: {
          searchPlaceholder: "Enter your postal code",
        },
      },
      validation: {
        required: true,
      },
    },
    {
      type: "documentUpload",
      title: "Upload Your Document",
      subtitle: "Please upload your document for processing",
      config: {
        acceptedTypes: [".pdf", ".doc", ".docx", ".txt"],
        maxFileSize: "10MB",
        labels: {
          uploadButton: "Choose File",
          dragDropText: "Drag and drop your file here",
          supportedFormats: "Supported formats: PDF, DOC, DOCX, TXT",
        },
      },
      validation: {
        required: false,
      },
    },
    {
      type: "documentInfo",
      title: "Document Information",
      subtitle: "Here's the processed information from your document",
      config: {
        displayMode: "scrollable",
        maxHeight: "400px",
        labels: {
          loadingText: "Processing your document...",
          errorText: "Unable to process document. Please try again.",
        },
      },
    },
    {
      type: "contact",
      title: "Your Contact Information",
      subtitle: "How can we reach you?",
      config: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number",
        },
        placeholders: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
      },
    },

  ],
  ui: {
    buttons: {
      next: "Continue",
      skip: "Skip",
      submit: "Submit",
      startOver: "Start Over",
      submitting: "Submitting...",
      check: "Check Availability",
      checking: "Checking...",
    },
    messages: {
      optional: "Optional",
      required: "Required",
      invalidEmail: "Please enter a valid email address",
      submitError: "There was an error submitting your form. Please try again.",
      thankYou: "Thank You!",
      submitAnother: "Submit Another Response",
      multiSelectHint: "Select all that apply",
      loadError: "Failed to load the form. Please refresh the page.",
      thisFieldRequired: "This field is required",
      enterValidEmail: "Please enter a valid email address",
    },
    contact: {
      title: "Need help?",
      description: "Contact our support team",
      email: "support@example.com",
      phone: "+1 (555) 987-6543",
    },
  },
  submission: {
    title: "Thank You for Your Submission! \u{1F389}",
    description: "We've received your information and will be in touch soon.",
    steps: [
      {
        title: "Request Received \u2713",
        description: "We've successfully received your request.",
      },
      {
        title: "Review Process \u23F1\uFE0F",
        description: "Our team is reviewing your submission.",
      },
      {
        title: "Next Steps \u{1F680}",
        description: "We'll contact you within 24 hours with a proposal.",
      },
    ],
  },
}

Follow these strict rules:
1. Each page should have 1-2 elements (except for tiles which can have up to 6)
2. Layout must be designed for 16:9 aspect ratio
3. Use minimal brand colors (1-2 brand colors globally)
4. Use emojis or icons from the lucide-react library
5. Always include a location question asking for postal code and country
6. Always include a contact step to collect user's contact information
7. Each tile or multiSelect step must have exactly 4 or 6 options
8. Keep descriptions under each option very short (less than 4 words)
9. Always use modern, concise language with emojis


`;
var demoFormConfig = {
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a"
      },
      primary: "#0E565B",
      background: {
        light: "#ffffff",
        white: "#ffffff"
      }
    }
  },
  steps: [
    {
      type: "tiles",
      title: "What are you looking for?",
      subtitle: "Select the option that best describes your needs",
      options: [
        {
          id: "web-design",
          title: "Website Design",
          description: "Professional, modern sites",
          icon: "Laptop"
        },
        {
          id: "mobile-app",
          title: "Mobile App",
          description: "iOS and Android apps",
          icon: "Smartphone"
        },
        {
          id: "branding",
          title: "Brand Identity",
          description: "Logo and brand assets",
          icon: "Palette"
        },
        {
          id: "marketing",
          title: "Digital Marketing",
          description: "Grow your audience",
          icon: "TrendingUp"
        }
      ]
    },
    {
      type: "multiSelect",
      title: "What features do you need?",
      subtitle: "Select all the features you want to include",
      options: [
        {
          id: "responsive",
          title: "Responsive Design",
          description: "Works on all devices",
          icon: "Smartphone"
        },
        {
          id: "ecommerce",
          title: "E-commerce",
          description: "Sell products online",
          icon: "ShoppingCart"
        },
        {
          id: "blog",
          title: "Blog System",
          description: "Content management",
          icon: "FileText"
        },
        {
          id: "analytics",
          title: "Analytics",
          description: "Track performance",
          icon: "BarChart"
        }
      ]
    },
    {
      type: "slider",
      title: "What's your budget?",
      subtitle: "Drag the slider to select your budget range",
      min: 1e3,
      max: 1e4,
      step: 500,
      defaultValue: 5e3,
      prefix: "$"
    },
    {
      type: "textbox",
      title: "Tell us about your project",
      subtitle: "Provide details about what you're looking to achieve",
      placeholder: "Enter project details here...",
      rows: 4,
      validation: {
        required: true,
        minLength: 20
      }
    },
    {
      type: "location",
      title: "Where are you located?",
      subtitle: "Please enter your location to check service availability",
      config: {
        labels: {
          searchPlaceholder: "Enter your postal code"
        }
      },
      validation: {
        required: true
      }
    },
    {
      type: "contact",
      title: "Your Contact Information",
      subtitle: "How can we reach you?",
      config: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number"
        },
        placeholders: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567"
        }
      }
    }
  ],
  ui: {
    buttons: {
      next: "Continue",
      skip: "Skip",
      submit: "Submit",
      startOver: "Start Over",
      submitting: "Submitting...",
      check: "Check Availability",
      checking: "Checking..."
    },
    messages: {
      optional: "Optional",
      required: "Required",
      invalidEmail: "Please enter a valid email address",
      submitError: "There was an error submitting your form. Please try again.",
      thankYou: "Thank You!",
      submitAnother: "Submit Another Response",
      multiSelectHint: "Select all that apply",
      loadError: "Failed to load the form. Please refresh the page.",
      thisFieldRequired: "This field is required",
      enterValidEmail: "Please enter a valid email address"
    },
    contact: {
      title: "Need help?",
      description: "Contact our support team",
      email: "support@example.com",
      phone: "+1 (555) 987-6543"
    }
  },
  submission: {
    title: "Thank You for Your Submission! \u{1F389}",
    description: "We've received your information and will be in touch soon.",
    steps: [
      {
        title: "Request Received \u2713",
        description: "We've successfully received your request."
      },
      {
        title: "Review Process \u23F1\uFE0F",
        description: "Our team is reviewing your submission."
      },
      {
        title: "Next Steps \u{1F680}",
        description: "We'll contact you within 24 hours with a proposal."
      }
    ]
  }
};
function validateAndDeduplicateForm(config) {
  const usedTitles = /* @__PURE__ */ new Set();
  const usedSubtitles = /* @__PURE__ */ new Set();
  const usedEmojis = /* @__PURE__ */ new Set();
  const getEmoji = (str) => {
    return null;
  };
  const makeUnique = (title, set) => {
    if (!title || typeof title !== "string") title = "Untitled";
    let newTitle = title;
    let counter = 1;
    while (set.has(newTitle)) {
      const emoji = getEmoji(title);
      const baseTitle = emoji ? title.replace(emoji, "").trim() : title;
      newTitle = `${baseTitle} ${counter}${emoji ? ` ${emoji}` : ""}`;
      counter++;
    }
    return newTitle;
  };
  config.steps = config.steps.map((step) => {
    step.title = makeUnique(step.title, usedTitles);
    usedTitles.add(step.title);
    step.subtitle = makeUnique(step.subtitle, usedSubtitles);
    usedSubtitles.add(step.subtitle);
    if ("options" in step && Array.isArray(step.options)) {
      const usedOptionTitles = /* @__PURE__ */ new Set();
      step.options = step.options.map((option) => {
        option.title = makeUnique(option.title, usedOptionTitles);
        usedOptionTitles.add(option.title);
        return option;
      });
    }
    return step;
  });
  return config;
}
function cleanText(str) {
  return str.trim();
}
function cleanOptionTitles(config) {
  config.steps = config.steps.map((step) => {
    if ("options" in step && Array.isArray(step.options)) {
      step.options = step.options.map((option) => ({
        ...option,
        title: typeof option.title === "string" ? cleanText(option.title) : option.title
      }));
    }
    return step;
  });
  return config;
}
function ensureTilesOptionCount(config) {
  let needsFix = false;
  for (const step of config.steps) {
    if (step.type === "tiles" && step.options && Array.isArray(step.options)) {
      if (step.options.length !== 4 && step.options.length !== 6) {
        needsFix = true;
        break;
      }
    }
  }
  if (!needsFix) return config;
  config.steps = config.steps.map((step) => {
    if (step.type === "tiles" && step.options && Array.isArray(step.options)) {
      let opts = step.options;
      if (opts.length < 4) {
        while (opts.length < 4) {
          opts.push({ ...opts[0], id: opts[0].id + "_dup" + opts.length });
        }
      } else if (opts.length === 5) {
        opts = opts.slice(0, 4);
      } else if (opts.length > 6) {
        opts = opts.slice(0, 6);
      }
      step.options = opts;
    }
    return step;
  });
  return config;
}
async function generateFormFromPrompt(prompt) {
  const customDemoForm = createCustomizedDemoForm(prompt);
  if (!GEMINI_API_KEY2) {
    console.warn(
      "GEMINI_API_KEY environment variable not set - using demo form configuration"
    );
    return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
  }
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY2}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Now create a form for the following request:
${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192
        }
      })
    });
    if (!response.ok) {
      console.error(
        `Gemini API HTTP error: ${response.status} ${response.statusText}`
      );
      try {
        const errorData = await response.json();
        console.error(`Gemini API error details: ${JSON.stringify(errorData)}`);
      } catch (e) {
        const errorText = await response.text();
        console.error(`Gemini API error response: ${errorText}`);
      }
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error(
        "Unexpected response structure from Gemini API:",
        JSON.stringify(data)
      );
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }
    const textResponse = data.candidates[0].content.parts[0].text;
    if (!textResponse) {
      console.error("Empty response from Gemini API");
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }
    try {
      let reorderFinalSteps2 = function(config) {
        const steps = config.steps;
        if (!Array.isArray(steps)) return config;
        const contactStepIndex = steps.findIndex((s) => s.type === "contact");
        const locationStepIndex = steps.findIndex((s) => s.type === "location");
        const contactStep = contactStepIndex !== -1 ? steps.splice(contactStepIndex, 1)[0] : null;
        const locationStep = locationStepIndex !== -1 ? steps.splice(
          locationStepIndex < contactStepIndex ? locationStepIndex : locationStepIndex - 1,
          1
        )[0] : null;
        if (locationStep) steps.push(locationStep);
        if (contactStep) steps.push(contactStep);
        config.steps = steps;
        return config;
      };
      var reorderFinalSteps = reorderFinalSteps2;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : textResponse;
      let formConfig2 = JSON.parse(jsonString);
      if (!formConfig2.steps || !Array.isArray(formConfig2.steps) || formConfig2.steps.length === 0) {
        console.warn("Invalid form configuration detected, attempting one retry...");
        try {
          const retryResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY2}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              systemInstruction: {
                role: "system",
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `This is a retry attempt. Please ensure valid form structure for the following request:
${prompt}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                // Reduced temperature for more focused output
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 8192
              }
            })
          });
          const retryData = await retryResponse.json();
          const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (retryText) {
            const retryJsonMatch = retryText.match(/\{[\s\S]*\}/);
            const retryConfig = JSON.parse(retryJsonMatch ? retryJsonMatch[0] : retryText);
            if (retryConfig.steps && Array.isArray(retryConfig.steps) && retryConfig.steps.length > 0) {
              formConfig2 = retryConfig;
            } else {
              console.error("Retry attempt failed: still invalid form configuration");
              return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
            }
          } else {
            console.error("Retry attempt failed: empty response");
            return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
          }
        } catch (retryError) {
          console.error("Retry attempt failed:", retryError);
          return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
        }
      }
      formConfig2.steps = formConfig2.steps.map((step) => {
        if ("label" in step && !("title" in step)) {
          step.title = step.label;
          delete step.label;
        } else if ("question" in step && !("title" in step)) {
          step.title = step.question;
          delete step.question;
        }
        if ("field" in step && !("subtitle" in step)) {
          step.subtitle = `Please select your ${step.field}`;
          delete step.field;
        } else if ("description" in step && !("subtitle" in step)) {
          step.subtitle = step.description;
          delete step.description;
        }
        if (step.type === "tiles" || step.type === "multiSelect") {
          if ("options" in step) {
            const options = step.options;
            if (Array.isArray(options)) {
              step.options = options.map((opt) => ({
                id: opt.value || opt.id || `option-${Math.random().toString(36).substring(2, 9)}`,
                title: opt.label || opt.title || "Option",
                description: opt.description || "",
                icon: opt.icon || "CheckCircle"
              }));
            }
          }
        }
        if (step.type === "location") {
          if (!("config" in step)) {
            step.config = {
              labels: {
                searchPlaceholder: "Enter your postal code"
              }
            };
          }
          if (!("validation" in step) && "required" in step) {
            step.validation = {
              required: step.required
            };
            delete step.required;
          }
        }
        if (step.type === "slider") {
          if ("required" in step) {
            delete step.required;
          }
          if (!("min" in step)) step.min = 0;
          if (!("max" in step)) step.max = 100;
          if (!("step" in step)) step.step = 1;
          if (!("defaultValue" in step)) step.defaultValue = 50;
        }
        if (step.type === "contact") {
          if (!("config" in step)) {
            step.config = {
              labels: {
                firstName: "First Name",
                lastName: "Last Name",
                email: "Email Address",
                phone: "Phone Number"
              },
              placeholders: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+1 (555) 123-4567"
              }
            };
          }
          if ("fields" in step && Array.isArray(step.fields)) {
            const fields = step.fields;
            fields.forEach((field) => {
              if (field.field === "name" || field.field === "firstName") {
                step.config.labels.firstName = field.label || "First Name";
                if (field.placeholder) {
                  step.config.placeholders.firstName = field.placeholder;
                }
              } else if (field.field === "lastName") {
                step.config.labels.lastName = field.label || "Last Name";
                if (field.placeholder) {
                  step.config.placeholders.lastName = field.placeholder;
                }
              } else if (field.field === "email") {
                step.config.labels.email = field.label || "Email Address";
                if (field.placeholder) {
                  step.config.placeholders.email = field.placeholder;
                }
              } else if (field.field === "phone") {
                step.config.labels.phone = field.label || "Phone Number";
                if (field.placeholder) {
                  step.config.placeholders.phone = field.placeholder;
                }
              }
            });
            delete step.fields;
          }
          if ("name" in step) {
            const nameConfig = step.name;
            if (nameConfig && typeof nameConfig === "object") {
              step.config.labels.firstName = nameConfig.label || "First Name";
              if (nameConfig.placeholder) {
                step.config.placeholders.firstName = nameConfig.placeholder;
              }
            }
            delete step.name;
          }
          if ("email" in step) {
            const emailConfig = step.email;
            if (emailConfig && typeof emailConfig === "object") {
              step.config.labels.email = emailConfig.label || "Email Address";
              if (emailConfig.placeholder) {
                step.config.placeholders.email = emailConfig.placeholder;
              }
            }
            delete step.email;
          }
          if ("phone" in step) {
            const phoneConfig = step.phone;
            if (phoneConfig && typeof phoneConfig === "object") {
              step.config.labels.phone = phoneConfig.label || "Phone Number";
              if (phoneConfig.placeholder) {
                step.config.placeholders.phone = phoneConfig.placeholder;
              }
            }
            delete step.phone;
          }
        }
        return step;
      });
      if (!formConfig2.ui) {
        formConfig2.ui = demoFormConfig.ui;
      }
      if (!formConfig2.submission) {
        formConfig2.submission = demoFormConfig.submission;
      }
      formConfig2 = reorderFinalSteps2(formConfig2);
      try {
        const flatTitles = [];
        formConfig2.steps.forEach((step) => {
          if (Array.isArray(step.options)) {
            step.options.forEach((opt) => {
              flatTitles.push(opt.title);
            });
          }
        });
        if (flatTitles.length) {
          const flatIcons = await generateIconsFromOptions(flatTitles);
          let idx = 0;
          formConfig2.steps.forEach((step) => {
            if (Array.isArray(step.options)) {
              step.options = step.options.map((opt) => ({
                ...opt,
                icon: flatIcons[idx++] || "Circle"
              }));
            }
          });
        }
      } catch (err) {
        console.warn("Icon augmentation failed, proceeding without it", err);
      }
      formConfig2 = cleanOptionTitles(formConfig2);
      formConfig2 = ensureTilesOptionCount(formConfig2);
      return validateAndDeduplicateForm(formConfig2);
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.warn("Using demo form configuration due to parsing error");
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.warn("Using demo form configuration due to API error");
    return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
  }
}
function createCustomizedDemoForm(prompt) {
  const customForm = JSON.parse(JSON.stringify(demoFormConfig));
  const promptLower = prompt.toLowerCase();
  if (customForm.steps && customForm.steps.length > 0) {
    const firstStep = customForm.steps[0];
    const promptWords = prompt.split(" ");
    if (promptWords.length > 5) {
      firstStep.title = promptWords.slice(0, 5).join(" ") + "...";
    } else {
      firstStep.title = prompt;
    }
    firstStep.subtitle = "Tell us about your needs";
    if (customForm.submission) {
      customForm.submission.title = "Thank You for Your Submission! \u{1F389}";
      customForm.submission.description = "We've received your information and will be in touch soon about your request.";
    }
    if (promptLower.includes("product") || promptLower.includes("service") || promptLower.includes("offering") || promptLower.includes("solution")) {
      if (firstStep.type === "tiles") {
        firstStep.title = "What are you interested in?";
        if (promptLower.includes("web") || promptLower.includes("website") || promptLower.includes("application")) {
          firstStep.options[0].title = "Website Development";
          firstStep.options[0].icon = "Globe";
        }
        if (promptLower.includes("consult") || promptLower.includes("advice")) {
          firstStep.options[1].title = "Consultation";
          firstStep.options[1].icon = "HelpCircle";
        }
        if (promptLower.includes("support") || promptLower.includes("help")) {
          firstStep.options[2].title = "Technical Support";
          firstStep.options[2].icon = "LifeBuoy";
        }
      }
    }
    const contactStep = customForm.steps.find(
      (step) => step.type === "contact"
    );
    if (contactStep) {
      contactStep.title = "Your Contact Information";
      contactStep.subtitle = "How can we reach you about your request?";
    }
  }
  return customForm;
}
async function editJsonWithLLM(original, instruction) {
  const fullPrompt = `
You are given this JSON only (no extra text):
${JSON.stringify(original, null, 2)}

Apply this instruction and output ONLY the modified, valid JSON:
"${instruction}" and make sure to keep everything ELSE ,apart from instructed changes, the same.
Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
`;
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY2}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        { role: "user", parts: [{ text: fullPrompt }] }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192
      }
    })
  });
  if (!response.ok) {
    throw new Error(
      `Gemini edit\u2011JSON API error: ${response.status} ${response.statusText}`
    );
  }
  const data = await response.json();
  const text2 = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text2) {
    throw new Error("Empty response from Gemini when editing JSON");
  }
  const match = text2.match(/\{[\s\S]*\}/);
  const jsonString = (match ? match[0] : text2).trim();
  try {
    const parsed = JSON.parse(jsonString);
    const cleaned = cleanOptionTitles(parsed);
    const ensured = ensureTilesOptionCount(cleaned);
    return JSON.stringify(ensured, null, 2);
  } catch (e) {
    return jsonString;
  }
}

// server/routes.ts
init_icons();

// server/admin.ts
import { Router } from "express";
import { z as z2 } from "zod";

// server/services/supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv4 from "dotenv";
dotenv4.config();
var supabaseUrl = process.env.SUPABASE_URL || "";
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";
function createSupabaseClient() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
      if (process.env.NODE_ENV === "production") {
        console.error("Application cannot start without Supabase credentials in production.");
        process.exit(1);
      }
      return null;
    }
    if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      console.error("Invalid SUPABASE_URL format. Expected: https://your-project.supabase.co");
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
      return null;
    }
    return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    return null;
  }
}
var supabase = createSupabaseClient();
async function createFormConfig(label, config, language = "en", domain = null, userId = null) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const finalDomain = domain || `domain_${Math.random().toString(36).substring(2, 8)}`;
  const tempLabel = "pending_label";
  const { data, error } = await supabase.from("form_config").insert([
    {
      label: tempLabel,
      config,
      language,
      domain: finalDomain,
      user_uuid: userId
    }
  ]).select("id").single();
  if (error) {
    console.error("Supabase error creating form config:", error);
    throw new Error(`Failed to create form config in Supabase: ${error.message}`);
  }
  const formId = data.id;
  let firstTitle = "untitled";
  if (config && Array.isArray(config.steps) && config.steps.length > 0 && config.steps[0].title) {
    firstTitle = String(config.steps[0].title).replace(/\s+/g, "_").toLowerCase();
  }
  const newLabel = `${firstTitle}_${formId}`;
  const baseUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://your-app.replit.app" : "http://localhost:5000");
  const uniqueUrl = `${baseUrl}/embed?language=${language}&label=${encodeURIComponent(newLabel)}&domain=${encodeURIComponent(finalDomain)}`;
  await supabase.from("form_config").update({
    label: newLabel,
    url: uniqueUrl
  }).eq("id", formId);
  return formId;
}
async function getFormConfig(id) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_config").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Supabase error fetching form config:", error);
    throw new Error(`Failed to fetch form config from Supabase: ${error.message}`);
  }
  return data;
}
async function getFormByProperties(language, label, domain) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_config").select("*").eq("language", language).eq("label", label).eq("domain", domain).single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error(`Supabase error getting form by properties:`, error);
    throw new Error(`Failed to get form by properties from Supabase: ${error.message}`);
  }
  if (data && !data.created_at) {
    data.created_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  return data;
}
async function getAllFormConfigs() {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_config").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase error getting form configs:", error);
    throw new Error(`Failed to get form configs from Supabase: ${error.message}`);
  }
  const formattedData = (data || []).map((item) => {
    if (!item.created_at) {
      item.created_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    return item;
  });
  return formattedData;
}
async function getUserFormConfigs(userId) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  console.log(`Fetching form configs for user ID: ${userId}`);
  const { data, error } = await supabase.from("form_config").select("*").eq("user_uuid", userId).order("created_at", { ascending: false });
  if (error) {
    console.error(`Supabase error getting form configs for user ${userId}:`, error);
    throw new Error(`Failed to get user form configs from Supabase: ${error.message}`);
  }
  const formattedData = (data || []).map((item) => {
    if (!item.created_at) {
      item.created_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    return item;
  });
  console.log(`Found ${formattedData.length} forms for user ${userId}`);
  return formattedData;
}
async function createFormResponse(label, responses, language = "en", domain = null, formId = null, userUuid = null) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").insert([
    {
      label,
      response: responses,
      language,
      domain,
      form_config_id: formId,
      user_uuid: userUuid
    }
  ]).select("id").single();
  if (error) {
    console.error("Supabase error creating form response:", error);
    throw new Error(`Failed to create form response in Supabase: ${error.message}`);
  }
  return data.id;
}
async function getAllFormResponses() {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase error getting all form responses:", error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }
  return data || [];
}
async function getFormResponsesByLabel(label) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").select("*").eq("label", label).order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase error fetching form responses:", error);
    throw new Error(`Failed to fetch form responses from Supabase: ${error.message}`);
  }
  return data || [];
}
async function deleteFormConfig(id) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { error } = await supabase.from("form_config").delete().eq("id", id);
  if (error) {
    console.error("Supabase error deleting form config:", error);
    return false;
  }
  return true;
}
async function updateFormConfig(id, updates) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { error } = await supabase.from("form_config").update(updates).eq("id", id);
  if (error) {
    console.error("Supabase error updating form config:", error);
    return false;
  }
  return true;
}
async function getFormResponsesByFormId(formId) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").select("*").eq("form_config_id", formId).order("created_at", { ascending: false });
  if (error) {
    console.error(`Supabase error getting form responses for form ID ${formId}:`, error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }
  return data || [];
}
async function getUserById(id) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("users").select("*").eq("uuid", id).single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Supabase error fetching user:", error);
    throw new Error(`Failed to fetch user from Supabase: ${error.message}`);
  }
  return data;
}
async function deductUserCredits(userId, credits) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const currentCredits = parseInt(user.credits || "0", 10);
  if (currentCredits < credits) {
    throw new Error("Insufficient credits");
  }
  const newCredits = currentCredits - credits;
  const { error } = await supabase.from("users").update({ credits: newCredits }).eq("uuid", userId);
  if (error) {
    console.error("Supabase error deducting user credits:", error);
    throw new Error(`Failed to deduct user credits: ${error.message}`);
  }
}
async function updateFormConsole(formId, consoleConfig) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    const { error } = await supabase.from("form_config").update({ form_console: consoleConfig }).eq("id", formId);
    if (error) {
      console.error("Error updating form console configuration:", error);
      throw new Error(`Failed to update form console: ${error.message}`);
    }
    console.log(`Updated form console configuration for form ${formId}`);
  } catch (err) {
    console.error("Error in updateFormConsole:", err);
    throw err;
  }
}
async function checkUniqueFormProperties(language, label, domain, excludeFormId) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    let query = supabase.from("form_config").select("id").eq("language", language).eq("label", label).eq("domain", domain);
    if (excludeFormId) {
      query = query.neq("id", excludeFormId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error checking unique form properties:", error);
      throw new Error(`Failed to check unique form properties: ${error.message}`);
    }
    return !data || data.length === 0;
  } catch (err) {
    console.error("Error in checkUniqueFormProperties:", err);
    throw err;
  }
}
async function updateFormProperties(formId, properties) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    const { error } = await supabase.from("form_config").update({
      language: properties.language,
      label: properties.label,
      domain: properties.domain,
      url: properties.url
    }).eq("id", formId);
    if (error) {
      console.error("Error updating form properties:", error);
      throw new Error(`Failed to update form properties: ${error.message}`);
    }
    console.log(`Updated form properties for form ${formId}`);
  } catch (err) {
    console.error("Error in updateFormProperties:", err);
    throw err;
  }
}

// server/admin.ts
var emailSchema = z2.string().email("Invalid email format");
var router = Router();
var requireAdmin = async (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Admin access required"
    });
  }
  next();
};
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address"
      });
    }
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
router.post("/logout", (req, res) => {
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
router.get("/status", (req, res) => {
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
router.get("/responses", requireAdmin, async (_req, res) => {
  try {
    try {
      console.log("Attempting to get form responses from Supabase...");
      const responses = await getAllFormResponses();
      const formattedResponses = responses.map((response) => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        // Access the response_data field from Supabase structure
        responses: response.response_data || {}
      }));
      return res.status(200).json({
        success: true,
        source: "supabase",
        data: formattedResponses
      });
    } catch (supabaseError) {
      console.error("Supabase service failed, falling back to database storage:", supabaseError);
      const responses = await storage.getFormResponses();
      const formattedResponses = responses.map((response) => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        responses: response.response || {}
      }));
      return res.status(200).json({
        success: true,
        source: "database",
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
router.get("/responses/:label", requireAdmin, async (req, res) => {
  try {
    const { label } = req.params;
    if (!label) {
      return res.status(400).json({
        success: false,
        message: "Form label is required"
      });
    }
    console.log(`Getting responses for label: ${label}`);
    try {
      console.log("Attempting to get form responses by label from Supabase...");
      let responses = await getFormResponsesByLabel(label);
      if (!responses || responses.length === 0) {
        console.log(`No exact matches for ${label} in Supabase, trying partial matches`);
        const allResponses = await getAllFormResponses();
        responses = allResponses.filter((response) => {
          if (!response.label) return false;
          return response.label.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(response.label.toLowerCase());
        });
        console.log(`Found ${responses.length} partial matches in Supabase`);
      }
      const formattedResponses = responses.map((response) => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        responses: response.response_data || {}
      }));
      return res.status(200).json({
        success: true,
        source: "supabase",
        formLabel: label,
        data: formattedResponses
      });
    } catch (supabaseError) {
      console.error("Supabase query failed, falling back to database storage:", supabaseError);
      let responses = await storage.getFormResponsesByLabel(label);
      if (!responses || responses.length === 0) {
        console.log(`No exact matches for ${label} in database, trying partial matches`);
        const allResponses = await storage.getFormResponses();
        responses = allResponses.filter((response) => {
          if (!response.label) return false;
          return response.label.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(response.label.toLowerCase());
        });
        console.log(`Found ${responses.length} partial matches in database`);
      }
      const formattedResponses = responses.map((response) => ({
        id: response.id,
        label: response.label || "Unnamed Form",
        submittedAt: response.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        responses: response.response || {}
      }));
      return res.status(200).json({
        success: true,
        source: "database",
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
router.get("/forms", requireAdmin, async (_req, res) => {
  try {
    try {
      console.log("Attempting to get form configurations from Supabase...");
      const forms = await getAllFormConfigs();
      const formattedForms = forms.map((form) => ({
        id: form.id,
        label: form.label || "Unnamed Form",
        createdAt: form.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        config: form.config
      }));
      return res.status(200).json({
        success: true,
        source: "supabase",
        data: formattedForms
      });
    } catch (supabaseError) {
      console.error("Supabase query failed, falling back to database storage:", supabaseError);
      const forms = await storage.getFormConfigs();
      const formattedForms = forms.map((form) => ({
        id: form.id,
        label: form.label || "Unnamed Form",
        createdAt: form.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        config: form.config
      }));
      return res.status(200).json({
        success: true,
        source: "database",
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
var admin_default = router;

// server/auth.ts
import { Router as Router2 } from "express";
import { z as z3 } from "zod";

// server/services/supabase-auth.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
import dotenv5 from "dotenv";
dotenv5.config();
var supabaseUrl2 = process.env.SUPABASE_URL;
var supabaseAnonKey2 = process.env.SUPABASE_ANON_KEY;
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl2 || !supabaseAnonKey2 || !supabaseServiceRoleKey) {
  throw new Error("Missing required Supabase environment variables");
}
var supabase2 = createClient2(supabaseUrl2, supabaseAnonKey2);
var adminSupabase = createClient2(supabaseUrl2, supabaseServiceRoleKey);
async function registerUser(email, password, username, isAdmin = false) {
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username
    }
  });
  if (authError) {
    console.error("Error registering user with Supabase Auth:", authError);
    throw new Error(`Failed to register user: ${authError.message}`);
  }
  try {
    const { data: userData, error: dbError } = await adminSupabase.from("users").insert([
      {
        username,
        email,
        password: "[SUPABASE_AUTH]",
        is_admin: isAdmin,
        uuid: authData.user?.id,
        credits: 5
      }
    ]).select().single();
    if (dbError) {
      console.error("Error storing user in Supabase users table:", dbError);
      await adminSupabase.auth.admin.deleteUser(authData.user?.id || "");
      throw new Error(`Failed to store user data: ${dbError.message}`);
    }
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      isAdmin: userData.is_admin,
      uuid: userData.uuid
    };
  } catch (error) {
    if (authData.user?.id) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
    }
    throw error;
  }
}
async function loginUser(email, password) {
  const { data, error } = await supabase2.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error("Error logging in user with Supabase Auth:", error);
    throw new Error(`Failed to login: ${error.message}`);
  }
  try {
    const { data: userData, error: dbError } = await adminSupabase.from("users").select("*").eq("uuid", data.user.id).single();
    if (dbError || !userData) {
      console.log("User not found in Supabase users table, creating record for existing auth user");
      const userEmail = data.user.email || "";
      const username = data.user.user_metadata?.username || userEmail.split("@")[0] || "user";
      if (!userEmail) {
        throw new Error("User email is required but not provided by Supabase Auth");
      }
      try {
        const { data: newUserData, error: insertError } = await adminSupabase.from("users").insert([
          {
            username,
            email: userEmail,
            password: "[SUPABASE_AUTH]",
            is_admin: false,
            uuid: data.user.id,
            credits: 5
          }
        ]).select().single();
        if (insertError) {
          console.error("Error creating user record in Supabase:", insertError);
          if (insertError.code === "23505") {
            console.log("User already exists, attempting to find and update existing user record");
            const { data: existingUser, error: findError } = await adminSupabase.from("users").select("*").eq("email", userEmail).single();
            if (findError || !existingUser) {
              throw new Error(`Failed to find existing user: ${findError?.message || "User not found"}`);
            }
            const { data: updatedUser, error: updateError } = await adminSupabase.from("users").update({ uuid: data.user.id }).eq("id", existingUser.id).select().single();
            if (updateError) {
              throw new Error(`Failed to update existing user: ${updateError.message}`);
            }
            return {
              token: data.session.access_token,
              user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.is_admin,
                uuid: updatedUser.uuid
              }
            };
          }
          throw new Error(`Failed to create user record: ${insertError.message}`);
        }
        return {
          token: data.session.access_token,
          user: {
            id: newUserData.id,
            username: newUserData.username,
            email: newUserData.email,
            isAdmin: newUserData.is_admin,
            uuid: newUserData.uuid
          }
        };
      } catch (error2) {
        console.error("Error creating user record:", error2);
        throw new Error(`Failed to create user record: ${error2.message}`);
      }
    }
    return {
      token: data.session.access_token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        isAdmin: userData.is_admin,
        uuid: userData.uuid
      }
    };
  } catch (dbError) {
    console.error("Error fetching user data from Supabase users table:", dbError);
    throw new Error(`Failed to fetch user data: ${dbError.message || JSON.stringify(dbError)}`);
  }
}
async function getCurrentUser(supabaseUserId) {
  if (supabaseUserId) {
    try {
      console.log(`Looking up user by session supabaseUserId: ${supabaseUserId}`);
      const { data: userData, error: dbError } = await adminSupabase.from("users").select("*").eq("uuid", supabaseUserId).single();
      if (!dbError && userData) {
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          isAdmin: userData.is_admin,
          uuid: userData.uuid
        };
      }
      console.log(`No user found with uuid: ${supabaseUserId}`);
    } catch (dbError) {
      console.error("Error fetching user by session ID from Supabase users table:", dbError);
    }
  }
  try {
    console.log("Trying to get user from Supabase auth");
    const { data: { user }, error } = await supabase2.auth.getUser();
    if (error || !user) {
      console.log("No authenticated user found in Supabase");
      return null;
    }
    try {
      const { data: userData, error: dbError } = await adminSupabase.from("users").select("*").eq("uuid", user.id).single();
      if (dbError || !userData) {
        console.log("User authenticated in Supabase but not found in users table, creating record");
        const userEmail = user.email || "";
        const username = user.user_metadata?.username || userEmail.split("@")[0] || "user";
        if (!userEmail) {
          console.error("User email is required but not provided by Supabase Auth");
          return null;
        }
        try {
          const { data: newUserData, error: insertError } = await adminSupabase.from("users").insert([
            {
              username,
              email: userEmail,
              password: "[SUPABASE_AUTH]",
              is_admin: false,
              uuid: user.id,
              credits: 5
            }
          ]).select().single();
          if (insertError) {
            console.error("Error creating user record in Supabase:", insertError);
            if (insertError.code === "23505") {
              const uniqueUsername = `${username}_${user.id.substring(0, 8)}`;
              const { data: retryUserData, error: retryError } = await adminSupabase.from("users").insert([
                {
                  username: uniqueUsername,
                  email: userEmail,
                  password: "[SUPABASE_AUTH]",
                  is_admin: false,
                  uuid: user.id,
                  credits: 5
                }
              ]).select().single();
              if (!retryError && retryUserData) {
                return {
                  id: retryUserData.id,
                  username: retryUserData.username,
                  email: retryUserData.email,
                  isAdmin: retryUserData.is_admin,
                  uuid: retryUserData.uuid
                };
              }
            }
            console.error("Failed to create user record in getCurrentUser");
            return null;
          }
          return {
            id: newUserData.id,
            username: newUserData.username,
            email: newUserData.email,
            isAdmin: newUserData.is_admin,
            uuid: newUserData.uuid
          };
        } catch (error2) {
          console.error("Error creating user record in getCurrentUser:", error2);
          return null;
        }
      }
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        isAdmin: userData.is_admin,
        uuid: userData.uuid
      };
    } catch (dbError) {
      console.error("Error fetching user data from Supabase users table:", dbError);
      return null;
    }
  } catch (error) {
    console.error("Error getting user from Supabase auth:", error);
    return null;
  }
}
async function logoutUser() {
  const { error } = await supabase2.auth.signOut();
  if (error) {
    console.error("Error logging out user:", error);
    throw new Error(`Failed to logout: ${error.message}`);
  }
  return true;
}

// server/auth.ts
var router2 = Router2();
var registerSchema = z3.object({
  username: z3.string().min(3, "Username must be at least 3 characters"),
  email: z3.string().email("Invalid email format"),
  password: z3.string().min(6, "Password must be at least 6 characters")
});
var loginSchema = z3.object({
  email: z3.string().email("Invalid email format"),
  password: z3.string().min(1, "Password is required")
});
router2.post("/register", async (req, res) => {
  try {
    const validateData = registerSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validateData.error.errors
      });
    }
    const { username, email, password } = validateData.data;
    const user = await registerUser(email, password, username);
    req.session.user = {
      email: user.email,
      isAdmin: user.isAdmin,
      supabaseUserId: user.uuid
    };
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session after registration:", err);
      } else {
        console.log("Session successfully saved after registration for user:", user.id);
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
router2.post("/login", async (req, res) => {
  try {
    const validateData = loginSchema.safeParse(req.body);
    if (!validateData.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validateData.error.errors
      });
    }
    const { email, password } = validateData.data;
    const result = await loginUser(email, password);
    req.session.user = {
      email: result.user.email,
      isAdmin: result.user.isAdmin,
      supabaseUserId: result.user.uuid
    };
    console.log("Creating login session with user ID:", result.user.uuid);
    console.log("Session before save:", req.sessionID, JSON.stringify(req.session, null, 2));
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session after login:", err);
      } else {
        console.log("Session successfully saved after login for user:", result.user.uuid);
        console.log("Session after save:", req.sessionID, JSON.stringify(req.session, null, 2));
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
router2.post("/logout", async (req, res) => {
  try {
    await logoutUser();
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
router2.get("/user", async (req, res) => {
  try {
    console.log("Session user data:", req.session.user);
    if (req.session.user && req.session.user.supabaseUserId) {
      console.log("Found session with user ID:", req.session.user.supabaseUserId);
      const currentUser2 = await getCurrentUser(req.session.user.supabaseUserId);
      if (currentUser2) {
        console.log("Successfully retrieved user from session ID");
        return res.status(200).json({
          success: true,
          isAuthenticated: true,
          user: {
            id: currentUser2.id,
            username: currentUser2.username,
            email: currentUser2.email,
            isAdmin: currentUser2.isAdmin
          }
        });
      } else {
        console.log("Session user ID did not retrieve a valid user, clearing session");
        req.session.destroy((err) => {
          if (err) console.error("Error destroying invalid session:", err);
        });
      }
    }
    console.log("Attempting to get user from Supabase auth");
    const currentUser = await getCurrentUser();
    if (currentUser) {
      console.log("User authenticated via Supabase, updating session");
      req.session.user = {
        email: currentUser.email,
        isAdmin: currentUser.isAdmin,
        supabaseUserId: currentUser.uuid
      };
      req.session.save((err) => {
        if (err) console.error("Error saving session:", err);
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
    console.log("No authenticated user found");
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
var auth_default = router2;

// server/services/api-key.ts
import crypto from "crypto";
async function apiKeyAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const apiKey = authHeader.split(" ")[1];
  const userResult = await client`
      SELECT * FROM users WHERE api_key = ${apiKey} LIMIT 1
    `;
  if (!userResult || userResult.length === 0) {
    return res.status(403).json({ error: "Invalid API key" });
  }
  req.user = {
    id: userResult[0].id,
    uuid: userResult[0].uuid,
    email: userResult[0].email,
    username: userResult[0].username
  };
  next();
}
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}
async function getOrCreateApiKeyForUser(userUuid) {
  const existing = await client`
    SELECT api_key FROM users WHERE uuid = ${userUuid} LIMIT 1
  `;
  if (existing?.[0]?.api_key) {
    return existing[0].api_key;
  }
  const newKey = generateApiKey();
  await client`
    UPDATE users
    SET api_key = ${newKey}
    WHERE uuid = ${userUuid}
  `;
  return newKey;
}

// server/routes.ts
import Stripe from "stripe";
import multer from "multer";
import mammoth from "mammoth";

// server/services/pdf-parser.ts
import pdfParse from "pdf-parse";
async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return { text: data.text };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF document - the file may be corrupted or unsupported");
  }
}

// server/services/supabase-storage.ts
import { createClient as createClient3 } from "@supabase/supabase-js";
import dotenv6 from "dotenv";
dotenv6.config();
var supabaseUrl3 = process.env.SUPABASE_URL || "";
var supabaseServiceRoleKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl3 || !supabaseServiceRoleKey2) {
  throw new Error("Missing required Supabase environment variables");
}
var supabase3 = createClient3(supabaseUrl3, supabaseServiceRoleKey2);
async function uploadDocumentToStorage(file, fileName, mimeType) {
  try {
    const timestamp2 = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp2}_${sanitizedFileName}`;
    const { data, error } = await supabase3.storage.from("documentscaile").upload(uniqueFileName, file, {
      contentType: mimeType,
      upsert: false
    });
    if (error) {
      console.error("Supabase Storage upload error:", error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
    const { data: publicUrlData } = supabase3.storage.from("documentscaile").getPublicUrl(uniqueFileName);
    if (!publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded document");
    }
    console.log("Document uploaded successfully:", {
      fileName: uniqueFileName,
      publicUrl: publicUrlData.publicUrl
    });
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading document to Supabase Storage:", error);
    throw error;
  }
}

// server/services/quotation-generator.ts
import dotenv7 from "dotenv";
dotenv7.config();
var GEMINI_API_KEY3 = process.env.GEMINI_API_KEY || "";
var GEMINI_API_URL2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
var TRANSLATION_PRICING_PROMPT = `FOR TRANSLATION
Item
Unit
Typical Unit Price (\u20AC)
Standard certified translation
per page
65-80 \u20AC 
Certification stamp (sworn seal)
per document
15 \u20AC 
Express service (48 h)
surcharge
+30 % of base translation fee (\u2248 20 \u20AC on one page) 
Tracked domestic shipping
flat
5 \u20AC 

// If Express Service option is chosen then put the +30% surcharge 
// Add domestic shipping surcharge to all
// Total displayed should be in a range and a sum. 
// Total will be multiplied based on number of pages
// Add 19% VAT`;
var QUOTATION_SYSTEM_PROMPT = `You are a translation price estimation agent.

Your task is to:
1. Analyze the provided form responses and document content
2. Use the following translation pricing structure:
${TRANSLATION_PRICING_PROMPT}
3. Calculate the estimated price range for the user's translation request, following all rules in the pricing prompt.
4. If Express Service is selected, add the 30% surcharge. Always add the domestic shipping fee. Multiply by number of pages if provided. Add 19% VAT.

CRITICAL RULES:
- Return ONLY the price range, the from and to value ,absolutely no other text, citing the estimated price range (e.g., "120-150 \u20AC").
- Do NOT generate a full business quotation, no headers, no lengthy text, no official formatting.
- Be concise and clear.
- Output only the price estimate, nothing else.`;
async function generateQuotation(request) {
  if (!GEMINI_API_KEY3) {
    console.warn("GEMINI_API_KEY not available for quotation generation");
    return {
      success: false,
      error: "AI service unavailable",
      quotationHtml: generateFallbackQuotation(request)
    };
  }
  try {
    const prompt = buildQuotationPrompt(request);
    const response = await fetch(`${GEMINI_API_URL2}?key=${GEMINI_API_KEY3}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: QUOTATION_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096
        }
      })
    });
    if (!response.ok) {
      console.error(`Quotation API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: "Failed to generate quotation",
        quotationHtml: generateFallbackQuotation(request)
      };
    }
    const data = await response.json();
    const quotationText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!quotationText) {
      console.error("Empty response from quotation API");
      return {
        success: false,
        error: "Empty response from AI",
        quotationHtml: generateFallbackQuotation(request)
      };
    }
    const cleanedQuotation = cleanQuotationHtml(quotationText);
    return {
      success: true,
      quotationHtml: cleanedQuotation
    };
  } catch (error) {
    console.error("Error generating quotation:", error);
    return {
      success: false,
      error: "AI service error",
      quotationHtml: generateFallbackQuotation(request)
    };
  }
}
function buildQuotationPrompt(request) {
  const { formResponses: formResponses2, documentContent, contentGenerationPrompt } = request;
  return `
You are a professional quotation generator. Based on the following information, create a structured, formal quotation:

Document Information:
${JSON.stringify(documentContent, null, 2)}

Form Responses:
${JSON.stringify(formResponses2, null, 2)}

${contentGenerationPrompt ? `
Quotation Template/Pricing Structure:
${contentGenerationPrompt}

Please use this template as the basis for your quotation. Follow the pricing structure, calculate totals according to the specified rules, and present it in a professional format.
` : `
Content Generation Prompt:
${contentGenerationPrompt || "Generate a professional quotation based on the provided information"}
`}

Please generate a formal quotation that includes:
1. Header with company information
2. Client details
3. Service description
4. Itemized pricing (following the template if provided)
5. Calculated totals with any applicable surcharges and taxes
6. Terms and conditions
7. Final total amount

The quotation should be professional, clear, and ready for client presentation. If a pricing template was provided, ensure all calculations follow the specified rules (e.g., surcharges, VAT, per-page multipliers).
 Return ONLY the price range, the from and to value ,absolutely no other text, citing the estimated price range (e.g., "120-150 \u20AC").
- Do NOT generate a full business quotation, no headers, no lengthy text, no official formatting.
- Be concise and clear.
- Output only the price estimate,the numerical price range nothing else.
  `;
}
function cleanQuotationHtml(quotationText) {
  let cleaned = quotationText.replace(/```html\s*/g, "").replace(/```\s*/g, "");
  if (!cleaned.includes("<div") && !cleaned.includes("<html")) {
    cleaned = `<div class="quotation-content">${cleaned}</div>`;
  }
  return cleaned;
}
function generateFallbackQuotation(request) {
  const { formResponses: formResponses2, contentGenerationPrompt } = request;
  return `
    <div class="quotation-content">
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 2px solid #0E565B;">
        <h1 style="color: #0E565B; margin: 0; font-size: 28px;">PROFESSIONAL QUOTATION</h1>
        <p style="color: #6a6a6a; margin: 5px 0 0 0;">Quote #${Date.now()}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Project Requirements</h3>
        <p style="color: #6B7280; line-height: 1.6;">${contentGenerationPrompt}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Service Details</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <p style="color: #374151; margin: 0; line-height: 1.6;">
            Based on your requirements, we will provide comprehensive services tailored to your specific needs.
            A detailed proposal will be prepared and sent to you within 24-48 hours.
          </p>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Next Steps</h3>
        <ol style="color: #6B7280; line-height: 1.6;">
          <li>Review of submitted information and documents</li>
          <li>Detailed project analysis and planning</li>
          <li>Comprehensive quotation preparation</li>
          <li>Direct contact for discussion and clarification</li>
        </ol>
      </div>

      <div style="background: #0E565B; color: white; padding: 20px; border-radius: 6px; text-align: center;">
        <p style="margin: 0; font-weight: 600;">Thank you for your interest in our services!</p>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">We will contact you soon with a detailed quotation.</p>
      </div>
    </div>
  `;
}

// server/console-functions/auto-select-first-option.ts
function autoSelectFirstOption(options) {
  const { formId, conditionResult, formConfig: formConfig2 } = options;
  console.log(`[Console Function] Auto-select first option triggered for form ${formId}`);
  const modifiedConfig = JSON.parse(JSON.stringify(formConfig2));
  if (modifiedConfig.steps && modifiedConfig.steps.length > 0) {
    const firstStep = modifiedConfig.steps[0];
    if (firstStep.type === "tiles" || firstStep.type === "multiSelect") {
      const stepWithOptions = firstStep;
      if (stepWithOptions.options && Array.isArray(stepWithOptions.options)) {
        for (const option of stepWithOptions.options) {
          if (conditionResult[option.id] === true) {
            console.log(`[Console Function] Pre-selecting option: ${option.id} (${option.title})`);
            option.preselected = true;
            if (firstStep.type === "tiles") {
              option.selected = true;
              stepWithOptions.options.forEach((opt) => {
                if (opt.id !== option.id) {
                  opt.selected = false;
                  opt.preselected = false;
                }
              });
              break;
            }
          }
        }
      }
    }
  }
  console.log(`[Console Function] Auto-select first option completed for form ${formId}`);
  return modifiedConfig;
}

// server/console-functions/send-brochure.ts
import { Resend } from "resend";
import dotenv8 from "dotenv";
dotenv8.config();
var resend = new Resend(process.env.RESEND_API_KEY);

// server/console-functions/executor.ts
async function executeFormConfigFunctions(formConfig2, consoleConfig) {
  if (!consoleConfig.enable) {
    return formConfig2;
  }
  let modifiedConfig = { ...formConfig2 };
  if (consoleConfig.formConfig.enabled_actions.includes("auto_select_first_option")) {
    const selectedOption = consoleConfig.formConfig.trigger.option;
    if (selectedOption) {
      const conditionResult = { [selectedOption]: true };
      try {
        modifiedConfig = autoSelectFirstOption({
          formId: 0,
          // Will be updated with actual form ID
          conditionResult,
          formConfig: modifiedConfig
        });
        console.log(`[Console Executor] Auto-select first option executed for option: ${selectedOption}`);
        process.stdout.write("");
      } catch (error) {
        console.error(`[Console Executor] Error executing auto-select first option:`, error);
        process.stderr.write("");
      }
    }
  }
  return modifiedConfig;
}

// server/routes.ts
var promptSchema = z4.object({
  prompt: z4.string().min(1)
});
var publishSchema = z4.object({
  originalFormId: z4.coerce.number().nullable().optional(),
  label: z4.string().min(1),
  config: z4.object({}).passthrough(),
  language: z4.string().default("en"),
  promptHistory: z4.array(z4.string()).optional()
});
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
async function registerRoutes(app2) {
  app2.get("/api/debug/session", (req, res) => {
    res.json({
      sessionID: req.sessionID,
      session: req.session,
      user: req.session.user || null
    });
  });
  app2.get("/api/dev/generate-api-key", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: No user session found" });
      }
      const apiKey = await getOrCreateApiKeyForUser(userId);
      return res.json({ apiKey });
    } catch (err) {
      console.error("Error generating API key:", err);
      return res.status(500).json({ error: "Failed to generate API key" });
    }
  });
  app2.get("/api/user/credits", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({
        credits: user.credits || 0
      });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      return res.status(500).json({ error: "Failed to fetch credits" });
    }
  });
  app2.post("/api/purchase-credits", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const creditPackages = {
        starter: { credits: 10, price: 5, name: "Starter" },
        pro: { credits: 25, price: 10, name: "Pro" },
        premium: { credits: 80, price: 20, name: "Premium" }
      };
      const { package: packageId } = req.body;
      const selectedPackage = creditPackages[packageId];
      if (!selectedPackage) {
        return res.status(400).json({ error: "Invalid package selected" });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-06-30.basil"
      });
      const session3 = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${selectedPackage.name} Credits Package`,
                description: `${selectedPackage.credits} form creation credits`
              },
              unit_amount: selectedPackage.price * 100
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/dashboard?payment=success`,
        cancel_url: `${req.protocol}://${req.get("host")}/dashboard?payment=cancelled`,
        metadata: {
          userId,
          credits: selectedPackage.credits.toString(),
          package: packageId
        }
      });
      return res.json({ sessionId: session3.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  app2.post("/api/icons", async (req, res) => {
    try {
      const { options } = req.body;
      if (!Array.isArray(options)) {
        return res.status(400).json({ error: "optionTitles must be an array" });
      }
      const { generateIconsFromOptions: generateIconsFromOptions2 } = await Promise.resolve().then(() => (init_icons(), icons_exports));
      const icons = await generateIconsFromOptions2(options);
      return res.json({ icons });
    } catch (error) {
      console.error("Error generating icons:", error);
      return res.status(500).json({ error: "Failed to generate icons" });
    }
  });
  app2.use("/api/admin", admin_default);
  app2.use("/api/auth", auth_default);
  app2.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }
      const responses = await getFormResponsesByFormId(formId);
      return res.json(responses);
    } catch (error) {
      console.error("Error fetching form responses:", error);
      return res.status(500).json({ error: "Failed to fetch responses" });
    }
  });
  app2.get("/api/forms", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const forms = await getUserFormConfigs(userId);
      return res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      return res.status(500).json({ error: "Failed to fetch forms" });
    }
  });
  app2.delete("/api/forms/:id", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }
      const success = await deleteFormConfig(formId);
      if (!success) {
        return res.status(404).json({ error: "Form not found or could not be deleted" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting form:", error);
      return res.status(500).json({ error: "Failed to delete form" });
    }
  });
  app2.post("/api/icons", async (req, res) => {
    try {
      const { optionTitles } = req.body;
      if (!Array.isArray(optionTitles)) {
        return res.status(400).json({ error: "optionTitles must be an array" });
      }
      const icons = await generateIconsFromOptions(optionTitles);
      return res.json({ icons });
    } catch (err) {
      console.error("Error in /api/icons:", err);
      return res.status(500).json({ error: err.message || "Internal error" });
    }
  });
  app2.post("/api/prompt", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0
        });
      }
      const validatedData = promptSchema.parse(req.body);
      const formConfig2 = await generateFormFromPrompt(validatedData.prompt);
      if (!formConfig2) {
        return res.status(500).json({ error: "Failed to generate form" });
      }
      const label = `Generated Form ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
      const savedFormId = await createFormConfig(
        label,
        formConfig2,
        "en",
        null,
        userId
      );
      await deductUserCredits(userId, 1);
      return res.json({ id: savedFormId, config: formConfig2 });
    } catch (error) {
      console.error("Error generating form:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to generate form" });
    }
  });
  app2.post("/api/generate-form", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.uuid;
      const user = await getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0
        });
      }
      const validatedData = promptSchema.parse(req.body);
      const formConfig2 = await generateFormFromPrompt(validatedData.prompt);
      if (!formConfig2) {
        return res.status(500).json({ error: "Failed to generate form" });
      }
      await deductUserCredits(userId, 1);
      return res.json(formConfig2);
    } catch (error) {
      console.error("Error generating form:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to generate form" });
    }
  });
  app2.post("/api/create-form-url", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.uuid;
      const user = await getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to create a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0
        });
      }
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing required field: prompt" });
      }
      const formConfig2 = await generateFormFromPrompt(prompt);
      if (!formConfig2) {
        return res.status(500).json({ error: "Failed to generate form configuration." });
      }
      const formId = await createFormConfig(prompt, formConfig2, void 0, void 0, userId);
      await deductUserCredits(userId, 1);
      const form = await getFormConfig(formId);
      return res.json({ url: form.url });
    } catch (error) {
      console.error("/api/create-form-url error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to create form and return URL." });
    }
  });
  app2.post("/api/update-form-console", apiKeyAuthMiddleware, async (req, res) => {
    try {
      const { label, language, domain, form_console } = req.body;
      if (!label || !language || !domain || !form_console) {
        return res.status(400).json({ error: "Missing required fields: label, language, domain, form_console" });
      }
      const form = await getFormByProperties(language, label, domain);
      if (!form) {
        return res.json({ success: false });
      }
      await updateFormConsole(form.id, form_console);
      return res.json({ success: true });
    } catch (error) {
      console.error("/api/update-form-console error:", error);
      return res.json({ success: false });
    }
  });
  app2.post("/api/publish", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const validatedData = publishSchema.parse(req.body);
      const { originalFormId } = validatedData;
      if (originalFormId) {
        await updateFormConfig(originalFormId, {
          config: validatedData.config,
          label: validatedData.label
        });
        const updatedForm = await getFormConfig(originalFormId);
        return res.json(updatedForm);
      } else {
        const formData = {
          userId,
          label: validatedData.label,
          config: validatedData.config,
          language: validatedData.language
        };
        const savedForm = await storage.createFormConfig(formData);
        return res.json(savedForm);
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid form data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to publish form" });
    }
  });
  app2.post("/api/edit-form", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await getUserById(userId);
      if (!user || (user.credits || 0) < 1) {
        return res.status(402).json({
          error: "Insufficient credits. You need 1 credit to edit a form.",
          creditsRequired: 1,
          creditsAvailable: user?.credits || 0
        });
      }
      const { currentConfig, instruction } = req.body;
      if (!currentConfig || !instruction) {
        return res.status(400).json({ error: "Missing currentConfig or instruction" });
      }
      const updatedConfig = await editJsonWithLLM(currentConfig, instruction);
      if (!updatedConfig) {
        return res.status(500).json({ error: "Failed to edit form" });
      }
      await deductUserCredits(userId, 1);
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(updatedConfig);
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse updated config" });
      }
      return res.json({ config: parsedConfig });
    } catch (error) {
      console.error("Error editing form:", error);
      return res.status(500).json({ error: "Failed to edit form" });
    }
  });
  app2.put("/api/forms/:id/properties", async (req, res) => {
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
      if (!language || !label || !domain) {
        return res.status(400).json({ error: "Language, label, and domain are required" });
      }
      if (!["en", "de"].includes(language)) {
        return res.status(400).json({ error: "Language must be either 'en' or 'de'" });
      }
      const form = await getFormConfig(formId);
      if (!form || form.user_uuid !== userId) {
        return res.status(404).json({ error: "Form not found" });
      }
      const isUnique = await checkUniqueFormProperties(
        language,
        label,
        domain,
        formId
        // Exclude current form from check
      );
      if (!isUnique) {
        return res.status(409).json({
          error: "This combination of language, label, and domain already exists. Please choose different values."
        });
      }
      await updateFormProperties(formId, {
        language,
        label,
        domain,
        url
      });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating form properties:", error);
      return res.status(500).json({ error: "Failed to update form properties" });
    }
  });
  app2.get("/api/forms/by-properties", async (req, res) => {
    try {
      const { language, label, domain } = req.query;
      if (!language || !label || !domain) {
        return res.status(400).json({ error: "Language, label, and domain are required" });
      }
      const form = await getFormByProperties(
        language,
        label,
        domain
      );
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
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
      return res.json(modifiedForm);
    } catch (error) {
      console.error("Error fetching form by properties:", error);
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  });
  app2.get("/api/forms/:id", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }
      const form = await getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
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
      return res.json(modifiedForm);
    } catch (error) {
      console.error("Error fetching form:", error);
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  });
  app2.post(
    "/api/upload-document",
    upload.single("document"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const file = req.file;
        let extractedText = "";
        try {
          if (file.mimetype === "application/pdf") {
            const pdfData = await parsePdf(file.buffer);
            extractedText = pdfData.text;
          } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
          } else if (file.mimetype === "text/plain") {
            extractedText = file.buffer.toString("utf-8");
          } else {
            return res.status(400).json({
              error: "Unsupported file type. Please upload a PDF, Word document, or text file."
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
        const documentUrl = await uploadDocumentToStorage(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        console.log("Document uploaded and processed:", {
          fileName: file.originalname,
          fileSize: file.size,
          documentUrl,
          extractedTextLength: extractedText.length
        });
        return res.json({
          documentUrl,
          extractedText
        });
      } catch (error) {
        console.error("Error processing document:", error);
        if (error instanceof Error) {
          return res.status(500).json({
            error: `Failed to process document: ${error.message}`
          });
        }
        return res.status(500).json({ error: "Failed to process document" });
      }
    }
  );
  app2.post("/api/forms/:id/submit", async (req, res) => {
    console.log("[Form Submission] Form submission received");
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }
      const form = await getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      console.log(`[Form Submission] Loaded form config for formId ${formId}: label=${form.label}`);
      if (form.form_console) {
        console.log(`[Form Submission] Loaded form_console config for formId ${formId}:`, JSON.stringify(form.form_console));
      } else {
        console.log(`[Form Submission] No form_console config found for formId ${formId}`);
      }
      const savedResponseId = await createFormResponse(
        form.label,
        req.body,
        "en",
        null,
        formId,
        null
        // userUuid
      );
      console.log(`[Form Submission] Form response saved with ID ${savedResponseId} for formId ${formId}`);
      return res.json({ success: true, id: savedResponseId });
    } catch (error) {
      console.error("Error submitting form response:", error);
      const errorMessage = error?.message || "Failed to submit response";
      return res.status(500).json({
        error: errorMessage,
        success: false
      });
    }
  });
  app2.post("/api/quotation-template", async (req, res) => {
    try {
      const { template, formId } = req.body;
      const userId = req.session.user?.supabaseUserId;
      if (!template || !formId) {
        return res.status(400).json({
          success: false,
          message: "Template and formId are required"
        });
      }
      if (!req.session.quotationTemplates) {
        req.session.quotationTemplates = {};
      }
      req.session.quotationTemplates[formId] = template;
      res.json({
        success: true,
        message: "Quotation template saved successfully"
      });
    } catch (error) {
      console.error("Error saving quotation template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save quotation template"
      });
    }
  });
  app2.get("/api/quotation-template/:formId", async (req, res) => {
    try {
      const { formId } = req.params;
      const userId = req.session.user?.supabaseUserId;
      const template = req.session.quotationTemplates?.[formId] || "";
      res.json({
        success: true,
        template
      });
    } catch (error) {
      console.error("Error retrieving quotation template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve quotation template"
      });
    }
  });
  app2.post("/api/generate-quotation", async (req, res) => {
    try {
      const { formResponses: formResponses2, documentData, contentPrompt, formId } = req.body;
      const stepTitle = Object.keys(documentData).find((key) => key.toLowerCase().includes("document info") || key.toLowerCase().includes("analyzing your document")) || "Document Information";
      console.log("[API] /api/generate-quotation called with:", { formResponses: formResponses2, documentData, contentPrompt, formId, stepTitle });
      const quotationResult = await generateQuotation({
        formResponses: formResponses2,
        documentContent: documentData.documentContent,
        contentGenerationPrompt: contentPrompt
      });
      console.log("[API] Gemini quotation result:", quotationResult);
      if (formId) {
        const responses = await getFormResponsesByFormId(formId);
        const latestResponse = responses && responses.length > 0 ? responses[0] : null;
        if (latestResponse) {
          const updatedResponse = {
            ...latestResponse.response,
            [stepTitle]: quotationResult.quotationHtml || quotationResult.quotation || "Failed to generate quotation."
          };
          await createFormResponse(
            latestResponse.label,
            updatedResponse,
            latestResponse.language,
            latestResponse.portal,
            formId,
            latestResponse.user_uuid || null
          );
          console.log("[API] Quotation saved in Supabase for formId", formId, "under key", stepTitle);
        } else {
          console.warn("[API] No existing form response found for formId", formId, ". Skipping Supabase save.");
        }
      } else {
        console.warn("[API] No formId provided. Skipping Supabase save.");
      }
      res.json({ quotation: quotationResult.quotationHtml || quotationResult.quotation });
    } catch (error) {
      console.error("[API] Error generating quotation:", error);
      res.status(500).json({ quotation: "An error occurred while generating the quotation." });
    }
  });
  app2.get("/api/console/:formId", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const form = await getFormConfig(formId);
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
  app2.put("/api/console/:formId", async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const userId = req.session.user?.supabaseUserId;
      const { consoleConfig } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const form = await getFormConfig(formId);
      if (!form || form.user_uuid !== userId) {
        return res.status(404).json({ error: "Form not found" });
      }
      await updateFormConsole(formId, consoleConfig);
      res.json({ success: true, message: "Console configuration updated" });
    } catch (error) {
      console.error("Error updating console config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Missing or invalid address" });
      }
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured on server" });
      }
      const fetch2 = (await import("node-fetch")).default;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await fetch2(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/geocode proxy:", error);
      res.status(500).json({ error: "Failed to fetch geocode data" });
    }
  });
  app2.get("/api/staticmap", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured on server" });
      }
      const params = new URLSearchParams(req.query);
      params.set("key", apiKey);
      const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
      const fetch2 = (await import("node-fetch")).default;
      const response = await fetch2(url);
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import session2 from "express-session";
import cors from "cors";
import dotenv9 from "dotenv";
dotenv9.config();
var app = express2();
app.set("trust proxy", 1);
var isProduction = process.env.NODE_ENV === "production";
var allowedOrigin = isProduction ? "https://formbuilder-v-9-final-partnerscaile.replit.app" : "http://localhost:5173";
console.log("CORS configuration:", {
  isProduction,
  allowedOrigin,
  nodeEnv: process.env.NODE_ENV
});
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session2({
  // SECOND_EDIT
  // When running behind a proxy _and_ using secure cookies we must tell
  // express-session about it, otherwise the secure cookie will not be
  // accepted. Only enable this flag in production to avoid warnings during
  // local development.
  proxy: isProduction,
  store: storage.sessionStore,
  name: "forms_engine_sid",
  secret: process.env.SESSION_SECRET || "forms-engine-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    httpOnly: true,
    secure: isProduction,
    // Set to true in production with HTTPS
    sameSite: isProduction ? "none" : "lax"
  }
}));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log("API Request details:", {
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
if (isProduction) {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  const originalResSend = res.send;
  res.send = function(bodyStr, ...args) {
    return originalResSend.apply(res, [bodyStr, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
