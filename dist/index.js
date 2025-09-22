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
Only use icons from the provided list. If no perfect match exists, choose the closest semantic match. You HAVE TO choose the closest semantic match in all the cases , default is just not an option.

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
          maxOutputTokens: 6e4,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      })
    });
    if (!res.ok) {
      console.error("Icon API error:", await res.text());
      throw new Error("Failed to generate icons");
    }
    const payload = await res.json();
    const part = payload?.candidates?.[0]?.content?.parts?.[0] ?? {};
    let iconsRaw = null;
    if (Array.isArray(part.json)) {
      iconsRaw = part.json;
    } else {
      let text2 = (part.text || "").trim();
      if (text2.startsWith("```")) {
        text2 = text2.replace(/```json|```/gi, "").trim();
      }
      try {
        iconsRaw = JSON.parse(text2);
      } catch {
        const match = text2.match(/\[[\s\S]*?\]/);
        if (match) {
          try {
            iconsRaw = JSON.parse(match[0]);
          } catch {
          }
        }
      }
    }
    if (!Array.isArray(iconsRaw)) {
      throw new Error("Invalid icon response format");
    }
    let icons = iconsRaw;
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
  credits: text("credits"),
  // Adding credits column from migration
  CRM_webhook: text("CRM_webhook")
  // Optional CRM webhook URL
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
  form_console: json("form_console").default("{}"),
  iconMode: text("icon_mode").default("lucide")
  // Added icon mode column
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
  form_console: true,
  iconMode: true
});
var formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  response: json("response"),
  domain: text("domain"),
  form_config_id: integer("form_config_id").references(() => formConfig.id),
  user_uuid: text("user_uuid"),
  // Add user_uuid to link responses to users
  temp_response: json("temp_response"),
  // Temporary response for per-slide tracking
  session_no: integer("session_no")
  // Session number for form interactions
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
  user_uuid: true,
  temp_response: true,
  session_no: true
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
      if (url.startsWith("/embed")) {
        res.setHeader("X-Frame-Options", "ALLOWALL");
        res.setHeader("Content-Security-Policy", "frame-ancestors http: https: data:");
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
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
    setHeaders: (res, path4) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (path4.endsWith(".js") || path4.endsWith(".css")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (path4.endsWith(".html")) {
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
      if (req.path.startsWith("/embed")) {
        res.setHeader("X-Frame-Options", "ALLOWALL");
        res.setHeader("Content-Security-Policy", "frame-ancestors http: https: data:");
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
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
import fs2 from "fs";
import path3 from "path";
dotenv3.config();
var GEMINI_API_KEY2 = process.env.GEMINI_API_KEY || "";
var GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
var SYSTEM_PROMPT = `You are a form generation engine that creates multi-step forms based on given prompts.
Output ONLY valid JSON without any explanation or extra text.
Make sure you extract all keywords from the prompt and include relevant questions that address the user's specific needs. If in the given prompt you feel the need to add a document upload step , add it .This can usually be deduced by looking for keywords like 'upload document' or 'try our service' or 'get a quote'.

CRITICAL RULES FOR TITLES AND QUESTIONS:
1. Each title and subtitle MUST be unique across all steps, and should never be untitled. It should hold significance. The title must be a question and the subtitle must be related to that question. No need for very long titles or subtitles, they should be to the point . FOR LOCATION STEP SUBTITLES ONLY POSTAL CODE IS REQUIRED SINCE THAT IS THE ONLY VALUE WE ASK OUR USER TO INPUT 
2. Never repeat the same question in different formats
3. Avoid semantically similar questions (e.g., "What's your budget?" vs "How much can you spend?")
4. Use distinct icons for each step
5. Ensure each option within tiles/multiSelect steps has a unique title
6. Make sure that the tiles step is always having only and exclusively 4 options . No other amount of options ,only 4 .
7. Make sure that the multiSelect step is always having only and exclusively 4 options . No other amount of options ,only 4 .
7. Make each step focus on a distinct aspect of information gathering
8. Make sure the dropdown slide has anywhere between 3-6 options . no more no less
9. Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, dropdown, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
10. Always make sure whenever a document upload step is added , a document info step is added right after it. So if the document upload step is at index 3 , the document info step should be at index 4.
11. If and only if there is a document upload step involved,  make sure that the previous steps are asking questions / contain content that is relevant to the document upload step and the document that needs to be uploaded. Let us say for example , if the document upload step is asking for a resume , make sure that the previous steps are asking questions like 'What is your current job title?' , 'What is your current company?' etc. Or if the document upload step is asking for a business plan , make sure that the previous steps are asking questions like 'What is your business idea?' , 'What is your business model?' etc.
12. Please make sure that the steps before the document upload step are the only ones that ask document upload related questions, rest can be generic based on prompt.
13. Always check if a number/amount of slides or questions is given. If so , generate the exact amount of slides asked , else generate about 7-8 slides.
14. Document upload steps should always be skippable (required: false) to allow users to proceed without uploading documents.
15. When a document upload step is skipped, the document info step should also be automatically skipped since there's no document to process.
16. Textbox steps should be skippable by default (required: false) to allow users to proceed without providing detailed text responses.


The following form configuration is to be used as a reference for any configs that you generate. Focus largely on structure and keynames, values are placeholders:

{
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a"
      },
      primary: "#10b981",
      background: {
        light: "#ffffff",
        white: "#ffffff"
      }
    }
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
          icon: ""
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: ""
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: ""
        },
        {
          id: "id_4",
          title: "Title_4",
          description: "Extremely Short Description",
          icon: ""
        }
      ]
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
          icon: ""
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: ""
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: ""
        },
        {
          id: "id_4",
          title: "Tite_4",
          description: "Extremely Short Description",
          icon: ""
        }
      ]
    },
    {
      type: "slider",
      title: "Title Name",
      subtitle: "Subtitle Name",
      min: min_val,
      max: max_val,
      step: step_for_slider_val,
      defaultValue: default_val,
      prefix: ""
    },
    {
      type: "textbox",
      title: "Title Name",
      subtitle: "Subtitle Name",
      placeholder: "Placeholder content",
      rows: num_rows,
      validation: {
        required: false,
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
      type: "documentUpload",
      title: "Upload Your Document",
      subtitle: "Please upload your document for processing (optional)",
      config: {
        acceptedTypes: [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"],
        maxFileSize: "10MB",
        labels: {
          uploadButton: "Choose File",
          dragDropText: "Drag and drop your file here",
          supportedFormats: "Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG"
        }
      },
      validation: {
        required: false
      }
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
          errorText: "Unable to process document. Please try again."
        }
      }
    },
    {
      type: "dropdown",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "option_1",
          title: "Option 1"
        },
        {
          id: "option_2",
          title: "Option 2"
        },
        {
          id: "option_3",
          title: "Option 3"
        },
        {
          id: "option_4",
          title: "Option 4"
        },
        {
          id: "option_5",
          title: "Option 5"
        }
      ],
      placeholder: "Select",
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
}


Follow these strict rules:
1. Each page should have 1-2 elements (except for tiles which can have up to 6)
2. Layout must be designed for 16:9 aspect ratio
3. Use colors exclusively from the theme.colors.primary field - do not generate or suggest additional colors
4. Always include a location question asking for postal code and country
5. Always include a contact step to collect user's contact information
6. Each tile or multiSelect step must have exactly 4 or 6 options
7. Keep descriptions under each option very short (less than 4 words)
8. Always use modern, concise language .


`;
var demoFormConfig = {
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a"
      },
      primary: "#10b981",
      background: {
        light: "#ffffff",
        white: "#ffffff"
      }
    }
  },
  steps: [
    {
      type: "tiles",
      title: "This is a DEMO FORM CONFIG , if you were not expecting this , please try again.",
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
        required: false,
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
function reorderFinalSteps(config) {
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
}
async function generateFormFromPrompt(prompt) {
  const customDemoForm = createCustomizedDemoForm(prompt);
  if (!GEMINI_API_KEY2) {
    console.warn(
      "GEMINI_API_KEY environment variable not set - using demo form configuration"
    );
    return {
      config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
      error: "GEMINI_API_KEY environment variable not set",
      fallbackReason: "API key missing"
    };
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
        tools: [
          {
            "googleSearch": {}
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 6e4
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
      return {
        config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
        error: `Gemini API HTTP error: ${response.status} ${response.statusText}`,
        fallbackReason: "API request failed"
      };
    }
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error(
        "Unexpected response structure from Gemini API:",
        JSON.stringify(data)
      );
      return {
        config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
        error: "Unexpected response structure from Gemini API",
        fallbackReason: "Invalid API response format"
      };
    }
    const textResponse = data.candidates[0].content.parts[0].text;
    if (!textResponse) {
      console.error("Empty response from Gemini API");
      return {
        config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
        error: "Empty response from Gemini API",
        fallbackReason: "No content received"
      };
    }
    let jsonMatch = null;
    let jsonString = textResponse;
    try {
      jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      jsonString = jsonMatch ? jsonMatch[0] : textResponse;
    } catch (matchError) {
      console.warn("Failed to extract JSON from response:", matchError);
      jsonString = textResponse;
    }
    try {
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
                maxOutputTokens: 6e4
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
              return {
                config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
                error: "Retry attempt failed: still invalid form configuration",
                fallbackReason: "Invalid form structure after retry"
              };
            }
          } else {
            console.error("Retry attempt failed: empty response");
            return {
              config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
              error: "Retry attempt failed: empty response",
              fallbackReason: "No content received on retry"
            };
          }
        } catch (retryError) {
          console.error("Retry attempt failed:", retryError);
          return {
            config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
            error: `Retry attempt failed: ${retryError}`,
            fallbackReason: "Retry mechanism failed"
          };
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
      formConfig2 = reorderFinalSteps(formConfig2);
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
          const [flatIcons, flatEmojis] = await Promise.all([
            generateIconsFromOptions(flatTitles),
            generateEmojisFromOptions(flatTitles)
          ]);
          let idx = 0;
          formConfig2.steps.forEach((step) => {
            if (Array.isArray(step.options)) {
              step.options = step.options.map((opt) => {
                const result = {
                  ...opt,
                  icon: flatIcons[idx] || "Circle",
                  emoji: flatEmojis[idx] || "\u2753"
                };
                idx++;
                return result;
              });
            }
          });
        }
      } catch (err) {
        console.warn("Icon/emoji augmentation failed, proceeding without it", err);
      }
      formConfig2 = cleanOptionTitles(formConfig2);
      formConfig2 = ensureTilesOptionCount(formConfig2);
      formConfig2 = validateAndDeduplicateForm(formConfig2);
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND ===");
      console.log(JSON.stringify(formConfig2, null, 2));
      console.log("=== END FORM CONFIGURATION ===");
      return { config: formConfig2 };
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.log("Attempting to fix JSON with dedicated JSON fixer agent...");
      try {
        const logDir = path3.join(process.cwd(), "logs");
        if (!fs2.existsSync(logDir)) {
          fs2.mkdirSync(logDir, { recursive: true });
        }
        const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
        const logFile = path3.join(logDir, `gemini-response-error-${timestamp2}.log`);
        const logContent = {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          error: parseError instanceof Error ? parseError.toString() : String(parseError),
          prompt,
          rawResponse: textResponse,
          jsonString: jsonMatch ? jsonMatch[0] : textResponse,
          responseLength: textResponse.length,
          errorPosition: parseError instanceof Error && parseError.toString().includes("position") ? parseError.toString().match(/position (\d+)/)?.[1] : "unknown"
        };
        fs2.writeFileSync(logFile, JSON.stringify(logContent, null, 2));
        console.log(`Gemini response error logged to: ${logFile}`);
      } catch (logError) {
        console.error("Failed to log Gemini response error:", logError);
      }
      try {
        const fixedJsonString = await fixJsonWithAgent(jsonString);
        console.log("JSON fixer agent returned response, attempting to parse...");
        let fixedFormConfig = JSON.parse(fixedJsonString);
        if (fixedFormConfig.steps && Array.isArray(fixedFormConfig.steps) && fixedFormConfig.steps.length > 0) {
          console.log("JSON fixer agent successfully fixed the malformed JSON!");
          fixedFormConfig.steps = fixedFormConfig.steps.map((step) => {
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
          if (!fixedFormConfig.ui) {
            fixedFormConfig.ui = demoFormConfig.ui;
          }
          if (!fixedFormConfig.submission) {
            fixedFormConfig.submission = demoFormConfig.submission;
          }
          fixedFormConfig = reorderFinalSteps(fixedFormConfig);
          try {
            const flatTitles = [];
            fixedFormConfig.steps.forEach((step) => {
              if (Array.isArray(step.options)) {
                step.options.forEach((opt) => {
                  flatTitles.push(opt.title);
                });
              }
            });
            if (flatTitles.length) {
              const [flatIcons, flatEmojis] = await Promise.all([
                generateIconsFromOptions(flatTitles),
                generateEmojisFromOptions(flatTitles)
              ]);
              let idx = 0;
              fixedFormConfig.steps.forEach((step) => {
                if (Array.isArray(step.options)) {
                  step.options = step.options.map((opt) => {
                    const result = {
                      ...opt,
                      icon: flatIcons[idx] || "Circle",
                      emoji: flatEmojis[idx] || "\u2753"
                    };
                    idx++;
                    return result;
                  });
                }
              });
            }
          } catch (err) {
            console.warn("Icon/emoji augmentation failed for fixed JSON, proceeding without it", err);
          }
          fixedFormConfig = cleanOptionTitles(fixedFormConfig);
          fixedFormConfig = ensureTilesOptionCount(fixedFormConfig);
          fixedFormConfig = validateAndDeduplicateForm(fixedFormConfig);
          console.log("=== FIXED FORM CONFIGURATION SENT TO FRONTEND ===");
          console.log(JSON.stringify(fixedFormConfig, null, 2));
          console.log("=== END FIXED FORM CONFIGURATION ===");
          return { config: fixedFormConfig };
        } else {
          console.error("JSON fixer agent returned invalid form structure");
          throw new Error("Fixed JSON still has invalid form structure");
        }
      } catch (fixError) {
        console.error("JSON fixer agent failed:", fixError);
        console.warn("Using demo form configuration due to JSON fixer failure");
        return {
          config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
          error: `Error parsing Gemini response as JSON: ${parseError}. JSON fixer also failed: ${fixError}`,
          fallbackReason: "JSON parsing failed and JSON fixer failed"
        };
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.warn("Using demo form configuration due to API error");
    return {
      config: validateAndDeduplicateForm(cleanOptionTitles(customDemoForm)),
      error: `Error calling Gemini API: ${error}`,
      fallbackReason: "API call failed"
    };
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
async function fixJsonWithAgent(malformedJson) {
  const JSON_FIXER_PROMPT = `You are a JSON fixer.
Your task is to take any JSON-like input and return the same JSON with identical content but in a valid strict JSON format (RFC 8259 compliant).

Rules you must follow:

Preserve all content exactly (keys, values, strings, numbers, arrays, objects).

Do not reword, remove, or add anything.

Only correct the structure.

Always output valid strict JSON (nothing else, no explanations, no comments).

Common fixes you must apply:

Remove trailing commas from objects and arrays.

Ensure all keys are double-quoted.

Ensure all string values are double-quoted.

Remove any comments (// or /* */) if present.

Fix illegal characters after values (e.g., stray ",).

Do not pretty-print unless the input was pretty-printed. Keep formatting consistent with input style if possible.

The output must be pure JSON only.`;
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY2}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: JSON_FIXER_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Fix this malformed JSON:
${malformedJson}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          // Very low temperature for consistent JSON fixing
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 6e4
        }
      })
    });
    if (!response.ok) {
      console.error(`JSON fixer API HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`JSON fixer API HTTP error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected response structure from JSON fixer API:", JSON.stringify(data));
      throw new Error("Unexpected response structure from JSON fixer API");
    }
    const fixedJsonText = data.candidates[0].content.parts[0].text;
    if (!fixedJsonText) {
      console.error("Empty response from JSON fixer API");
      throw new Error("Empty response from JSON fixer API");
    }
    const jsonMatch = fixedJsonText.match(/\{[\s\S]*\}/);
    const fixedJsonString = jsonMatch ? jsonMatch[0] : fixedJsonText.trim();
    try {
      JSON.parse(fixedJsonString);
      console.log("JSON fixer agent successfully produced valid JSON");
      return fixedJsonString;
    } catch (validationError) {
      console.error("JSON fixer agent returned invalid JSON:", validationError);
      throw new Error(`JSON fixer agent returned invalid JSON: ${validationError}`);
    }
  } catch (error) {
    console.error("Error calling JSON fixer agent:", error);
    throw error;
  }
}
async function generateEmojisFromOptions(optionTitles) {
  const prompt = `
You are an emoji-selection engine.  
Given this array of option titles:
${JSON.stringify(optionTitles)}

Return ONLY a JSON array of emojis (strings) of the same length,
where each emoji semantically matches the corresponding title.
Example output: ["\u{1F37D}\uFE0F","\u{1F4CD}","\u{1F6CD}\uFE0F",\u2026]
  `.trim();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY2}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 6e4,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      })
    });
    if (!res.ok) {
      console.error("Emoji API error:", await res.text());
      throw new Error("Failed to generate emojis");
    }
    const payload = await res.json();
    const part = payload?.candidates?.[0]?.content?.parts?.[0] ?? {};
    let emojisRaw = null;
    if (Array.isArray(part.json)) {
      emojisRaw = part.json;
    } else {
      let text2 = (part.text || "").trim();
      if (text2.startsWith("```")) {
        text2 = text2.replace(/```json|```/gi, "").trim();
      }
      try {
        emojisRaw = JSON.parse(text2);
      } catch {
        const match = text2.match(/\[[\s\S]*?\]/);
        if (match) {
          try {
            emojisRaw = JSON.parse(match[0]);
          } catch {
          }
        }
      }
    }
    if (!Array.isArray(emojisRaw)) {
      throw new Error("Invalid emoji response format");
    }
    let emojis = emojisRaw;
    while (emojis.length < optionTitles.length) {
      emojis.push("\u2753");
    }
    return emojis.slice(0, optionTitles.length);
  } catch (error) {
    console.error("Error generating emojis:", error);
    return optionTitles.map(() => "\u2753");
  }
}
async function editJsonWithLLM(original, instruction) {
  const fullPrompt = `
You are given this JSON only (no extra text):
${JSON.stringify(original, null, 2)}

Apply this instruction and output ONLY the modified, valid JSON:
"${instruction}" and make sure to keep everything ELSE ,apart from instructed changes, the same.
Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, dropdown, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
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
        maxOutputTokens: 6e4
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
async function createFormConfig(label, config, language = "en", domain = null, userId = null, iconMode = "lucide") {
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
      user_uuid: userId,
      icon_mode: iconMode
      // Already correct snake_case
    }
  ]).select("id").single();
  if (error) {
    console.error("Supabase error creating form config:", error);
    throw new Error(`Failed to create form config in Supabase: ${error.message}`);
  }
  const formId = data.id;
  const finalLabel = label;
  console.log("\u{1F4BE} SUPABASE - createFormConfig received:", {
    label,
    finalLabel,
    language,
    domain: finalDomain,
    iconMode,
    formId
  });
  const baseUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://formbuilder-v-9-final-2-partnerscaile.replit.app" : "http://localhost:5000");
  const uniqueUrl = `${baseUrl}/embed?language=${language}&label=${encodeURIComponent(finalLabel)}&domain=${encodeURIComponent(finalDomain)}`;
  console.log("\u{1F4BE} SUPABASE - Generated URL:", uniqueUrl);
  await supabase.from("form_config").update({
    label: finalLabel,
    url: uniqueUrl
  }).eq("id", formId);
  console.log("\u{1F4BE} SUPABASE - Updated form with label:", finalLabel);
  return formId;
}
async function getFormConfig(id) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  console.log("\u{1F5C4}\uFE0F SUPABASE - getFormConfig called for ID:", id);
  const { data, error } = await supabase.from("form_config").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") {
      console.log("\u274C SUPABASE - Form config not found for ID:", id);
      return null;
    }
    console.error("\u274C SUPABASE - Error fetching form config:", error);
    throw new Error(`Failed to fetch form config from Supabase: ${error.message}`);
  }
  const mappedData = {
    ...data,
    iconMode: data?.icon_mode || "lucide"
    // Map icon_mode to iconMode
  };
  console.log("\u2705 SUPABASE - Form config retrieved:", {
    id: mappedData?.id,
    label: mappedData?.label,
    iconMode: mappedData?.iconMode,
    hasConfig: !!mappedData?.config
  });
  return mappedData;
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
  const mappedData = {
    ...data,
    iconMode: data?.icon_mode || "lucide"
    // Map icon_mode to iconMode
  };
  if (mappedData.config && typeof mappedData.config === "object") {
    console.log(`[Supabase] Form ${mappedData.id} config structure:`, {
      hasSteps: !!mappedData.config.steps,
      stepsType: typeof mappedData.config.steps,
      isArray: Array.isArray(mappedData.config.steps)
    });
    if (mappedData.config.steps && !Array.isArray(mappedData.config.steps) && typeof mappedData.config.steps === "object") {
      console.log(`[Supabase] Converting steps object to array for form ${mappedData.id}`);
      try {
        const keys = Object.keys(mappedData.config.steps).filter((k) => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
        if (keys.length > 0) {
          const stepsArray = keys.map((k) => mappedData.config.steps[k]);
          mappedData.config.steps = stepsArray;
          console.log(`[Supabase] Successfully converted steps to array with length: ${stepsArray.length}`);
        }
      } catch (err) {
        console.error(`[Supabase] Error converting steps to array:`, err);
      }
    }
  }
  return mappedData;
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
async function getNextSessionNumber(formId) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").select("session_no").eq("form_config_id", formId).order("session_no", { ascending: false }).limit(1);
  if (error) {
    console.error("Supabase error getting next session number:", error);
    throw new Error(`Failed to get next session number: ${error.message}`);
  }
  const maxSession = data?.[0]?.session_no || 0;
  return maxSession + 1;
}
async function createFormSession(formId, sessionNo, formData) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { data, error } = await supabase.from("form_responses").insert([
    {
      label: formData.label,
      language: formData.language || "en",
      domain: formData.domain,
      form_config_id: formId,
      user_uuid: formData.userUuid,
      session_no: sessionNo,
      temp_response: {},
      // Start with empty temp response
      response: null
      // Main response stays null until form is submitted
    }
  ]).select("id").single();
  if (error) {
    console.error("Supabase error creating form session:", error);
    throw new Error(`Failed to create form session: ${error.message}`);
  }
  console.log(`[Session] Created new session ${sessionNo} for form ${formId} with ID ${data.id}`);
  return data.id;
}
async function updateTempResponse(sessionId, tempResponse) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  const { error } = await supabase.from("form_responses").update({ temp_response: tempResponse }).eq("id", sessionId);
  if (error) {
    console.error("Supabase error updating temp response:", error);
    throw new Error(`Failed to update temp response: ${error.message}`);
  }
  console.log(`[Session] Updated temp response for session ID ${sessionId}`);
}
async function completeFormSession(sessionId, finalResponse) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    const { error } = await supabase.from("form_responses").update({
      response: finalResponse,
      temp_response: null
      // Clear temp response since we now have the final response
    }).eq("id", sessionId);
    if (error) {
      console.error("Supabase error completing form session:", error);
      return false;
    }
    console.log(`[Session] Completed session ${sessionId} - moved temp response to final response`);
    return true;
  } catch (error) {
    console.error("Error in completeFormSession:", error);
    return false;
  }
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
  const dbUpdates = {};
  if (updates.config) dbUpdates.config = updates.config;
  if (updates.label) dbUpdates.label = updates.label;
  if (updates.iconMode) dbUpdates.icon_mode = updates.iconMode;
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  console.log("\u{1F5C4}\uFE0F SUPABASE - updateFormConfig called:", { id, updates, dbUpdates });
  const { error } = await supabase.from("form_config").update(dbUpdates).eq("id", id);
  if (error) {
    console.error("\u274C SUPABASE - Error updating form config:", error);
    return false;
  }
  console.log("\u2705 SUPABASE - Form config updated successfully");
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
async function updateUserWebhook(userId, webhookUrl) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    console.log(`[Webhook] Attempting to update webhook for user ${userId} with URL: ${webhookUrl}`);
    const { error } = await supabase.from("users").update({ "CRM_webhook": webhookUrl }).eq("uuid", userId);
    if (error) {
      console.error("Error updating user webhook:", error);
      return false;
    }
    console.log(`[Webhook] Successfully updated webhook for user ${userId}`);
    return true;
  } catch (err) {
    console.error("Error in updateUserWebhook:", err);
    return false;
  }
}
async function updateUserPrivacyPolicy(userId, privacyPolicyLink) {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  }
  try {
    console.log(`[Privacy Policy] Attempting to update privacy policy for user ${userId} with URL: ${privacyPolicyLink}`);
    console.log(`[Privacy Policy] Supabase client initialized:`, !!supabase);
    const { data, error } = await supabase.from("users").update({ "privacy_policy": privacyPolicyLink }).eq("uuid", userId).select();
    console.log(`[Privacy Policy] Supabase response data:`, data);
    console.log(`[Privacy Policy] Supabase response error:`, error);
    if (error) {
      console.error("Error updating user privacy policy:", error);
      return false;
    }
    console.log(`[Privacy Policy] Successfully updated privacy policy for user ${userId}`);
    return true;
  } catch (err) {
    console.error("Error in updateUserPrivacyPolicy:", err);
    return false;
  }
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
        credits: 1e3
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
            credits: 1e3
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
              credits: 1e3
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
                  credits: 1e3
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

// server/services/document-analyzer.ts
import dotenv7 from "dotenv";
dotenv7.config();
var GEMINI_API_KEY3 = process.env.GEMINI_API_KEY || "";
var GEMINI_API_URL2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
var DOCUMENT_ANALYSIS_SYSTEM_PROMPT = `You are a document analysis agent.

Your task is to:
1. Answer the specific question asked by the document info step
2. Provide ONLY the direct answer

CRITICAL RULES:
- Answer the question in 1-2 sentences maximum
- Do NOT mention "based on provided responses" or similar phrases
- Do NOT describe the document content or context
- Do NOT include document details or file names
- Focus ONLY on answering the question asked
- Use simple, clear language
- Output ONLY the answer, nothing else
- Do NOT use markdown formatting (no bold, italic, code, headers, bullets, etc.)
- Output plain text only`;
async function analyzeDocument(request) {
  console.log("[DOCUMENT-ANALYZER] Starting document analysis with request:", {
    hasFormResponses: !!request.formResponses,
    formResponsesKeys: Object.keys(request.formResponses || {}),
    hasDocumentContent: !!request.documentContent,
    documentContentLength: request.documentContent?.length || 0,
    hasDocumentUrl: !!request.documentUrl,
    documentUrl: request.documentUrl,
    question: request.question,
    isImage: request.isImage
  });
  if (!GEMINI_API_KEY3) {
    console.warn("GEMINI_API_KEY not available for document analysis");
    return {
      success: false,
      error: "AI service unavailable",
      answer: generateFallbackAnswer(request)
    };
  }
  try {
    const prompt = buildAnalysisPrompt(request);
    console.log("[DOCUMENT-ANALYZER] Built prompt:", prompt);
    let requestBody;
    if (request.isImage && request.documentUrl) {
      try {
        console.log("[DOCUMENT-ANALYZER] Fetching image from URL:", request.documentUrl);
        const imageResponse = await fetch(request.documentUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");
        requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096
          }
        };
      } catch (imageError) {
        console.error("[DOCUMENT-ANALYZER] Error fetching image:", imageError);
        requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
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
        };
      }
    } else {
      requestBody = {
        systemInstruction: {
          role: "system",
          parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
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
      };
    }
    console.log("[DOCUMENT-ANALYZER] Request body for Gemini:", JSON.stringify(requestBody, null, 2));
    const response = await fetch(`${GEMINI_API_URL2}?key=${GEMINI_API_KEY3}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      console.error(`Document Analysis API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: "Failed to analyze document",
        answer: generateFallbackAnswer(request)
      };
    }
    const data = await response.json();
    console.log("[DOCUMENT-ANALYZER] Raw Gemini API response:", JSON.stringify(data, null, 2));
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("[DOCUMENT-ANALYZER] Extracted analysis text:", analysisText);
    if (!analysisText) {
      console.error("Empty response from document analysis API");
      return {
        success: false,
        error: "Empty response from AI",
        answer: generateFallbackAnswer(request)
      };
    }
    const cleanedAnswer = cleanAnalysisText(analysisText);
    console.log("[DOCUMENT-ANALYZER] After cleaning:", cleanedAnswer);
    const maxLength = 200;
    let finalAnswer = cleanedAnswer;
    if (cleanedAnswer.length > maxLength) {
      const textContent = cleanedAnswer.replace(/<[^>]*>/g, "");
      const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      if (sentences.length >= 2) {
        const shortAnswer = sentences.slice(0, 2).join(". ") + ".";
        finalAnswer = `<div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">${shortAnswer}</div>`;
      }
    }
    finalAnswer = finalAnswer.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/_/g, "");
    console.log("[DOCUMENT-ANALYZER] Final answer before return:", finalAnswer);
    console.log("[DOCUMENT-ANALYZER] Final answer length:", finalAnswer.length);
    return {
      success: true,
      answer: finalAnswer
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    return {
      success: false,
      error: "AI service error",
      answer: generateFallbackAnswer(request)
    };
  }
}
function buildAnalysisPrompt(request) {
  const { formResponses: formResponses2, documentContent, documentUrl, question, isImage } = request;
  console.log("[DOCUMENT-ANALYZER] Building prompt for:", { isImage, hasDocumentUrl: !!documentUrl, hasDocumentContent: !!documentContent });
  if (isImage) {
    return `
Question: ${question}

Document Type: Image
Image URL: ${documentUrl}

Please analyze this image and answer the question above in 1-2 sentences maximum. Do not mention form responses, document context, or any other details. Provide ONLY the direct answer to the question.
`;
  } else {
    return `
Question: ${question}

Document Type: Text-based document
Document Content: ${documentContent || "No text content available"}

Answer the question above in 1-2 sentences maximum. Do not mention form responses, document context, or any other details. Provide ONLY the direct answer to the question.
`;
  }
}
function cleanAnalysisText(analysisText) {
  console.log("[DOCUMENT-ANALYZER] Starting to clean text:", analysisText);
  let cleaned = analysisText.replace(/```html\s*/g, "").replace(/```\s*/g, "");
  console.log("[DOCUMENT-ANALYZER] After removing code blocks:", cleaned);
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  console.log("[DOCUMENT-ANALYZER] After removing HTML tags:", cleaned);
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/`(.*?)`/g, "$1");
  cleaned = cleaned.replace(/_(.*?)_/g, "$1");
  cleaned = cleaned.replace(/~~(.*?)~~/g, "$1");
  console.log("[DOCUMENT-ANALYZER] After removing markdown formatting:", cleaned);
  cleaned = cleaned.replace(/based on (the )?provided (responses?|context|information)/gi, "");
  cleaned = cleaned.replace(/based on (the )?document (content|context)/gi, "");
  cleaned = cleaned.replace(/according to (the )?form responses?/gi, "");
  cleaned = cleaned.replace(/using (the )?provided (data|information)/gi, "");
  console.log("[DOCUMENT-ANALYZER] After removing context references:", cleaned);
  cleaned = cleaned.replace(/^#+\s*/gm, "");
  cleaned = cleaned.replace(/^\s*\d+\.\s*/gm, "");
  console.log("[DOCUMENT-ANALYZER] After removing headers and lists:", cleaned);
  cleaned = cleaned.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/_/g, "");
  console.log("[DOCUMENT-ANALYZER] After final markdown removal:", cleaned);
  cleaned = cleaned.trim().replace(/\s+/g, " ");
  console.log("[DOCUMENT-ANALYZER] After whitespace cleanup:", cleaned);
  if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
    cleaned += ".";
  }
  cleaned = `<div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">${cleaned}</div>`;
  console.log("[DOCUMENT-ANALYZER] Final cleaned result:", cleaned);
  return cleaned;
}
function generateFallbackAnswer(request) {
  const { question, isImage } = request;
  return `
    <div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">
      <p style="margin: 0;">
        AI analysis service is currently unavailable. We will contact you within 24-48 hours with a detailed analysis.
      </p>
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
  promptHistory: z4.array(z4.string()).optional(),
  iconMode: z4.enum(["lucide", "emoji", "none"]).optional()
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
  app2.get("/api/user/webhook", async (req, res) => {
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
        webhookUrl: user.CRM_webhook || ""
      });
    } catch (error) {
      console.error("Error fetching user webhook URL:", error);
      return res.status(500).json({ error: "Failed to fetch webhook URL" });
    }
  });
  app2.post("/api/user/webhook", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { webhookUrl } = req.body;
      if (!webhookUrl) {
        return res.status(400).json({ error: "Webhook URL is required" });
      }
      try {
        new URL(webhookUrl);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      const success = await updateUserWebhook(userId, webhookUrl);
      console.log(`[Webhook] Update result for user ${userId}: ${success}`);
      if (!success) {
        return res.status(500).json({ error: "Failed to save webhook URL" });
      }
      return res.json({ success: true, message: "Webhook URL saved successfully" });
    } catch (error) {
      console.error("Error saving user webhook URL:", error);
      return res.status(500).json({ error: "Failed to save webhook URL" });
    }
  });
  app2.post("/api/user/webhook/test", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { webhookUrl } = req.body;
      if (!webhookUrl) {
        return res.status(400).json({ error: "Webhook URL is required" });
      }
      const testPayload = {
        event: "test",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: "This is a test webhook from your form builder",
        user: {
          id: userId,
          email: req.session.user?.email
        }
      };
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FormBuilder/1.0"
        },
        body: JSON.stringify(testPayload)
      });
      if (!response.ok) {
        return res.status(400).json({
          error: "Webhook test failed",
          status: response.status,
          statusText: response.statusText
        });
      }
      return res.json({ success: true, message: "Test webhook sent successfully" });
    } catch (error) {
      console.error("Error testing webhook:", error);
      return res.status(500).json({ error: "Failed to test webhook" });
    }
  });
  app2.get("/api/user/privacy-policy", async (req, res) => {
    try {
      console.log("[Privacy Policy GET] Request received");
      const userId = req.session.user?.supabaseUserId;
      console.log("[Privacy Policy GET] User ID:", userId);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await getUserById(userId);
      console.log("[Privacy Policy GET] User data:", user);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log("[Privacy Policy GET] Privacy policy link:", user.privacy_policy);
      return res.json({
        privacyPolicyLink: user.privacy_policy || ""
      });
    } catch (error) {
      console.error("Error fetching user privacy policy:", error);
      return res.status(500).json({ error: "Failed to fetch privacy policy" });
    }
  });
  app2.post("/api/user/privacy-policy", async (req, res) => {
    try {
      console.log("[Privacy Policy API] Request received:", req.body);
      const userId = req.session.user?.supabaseUserId;
      console.log("[Privacy Policy API] User ID:", userId);
      if (!userId) {
        console.log("[Privacy Policy API] No user ID found in session");
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { privacyPolicyLink } = req.body;
      console.log("[Privacy Policy API] Privacy policy link:", privacyPolicyLink);
      if (!privacyPolicyLink) {
        return res.status(400).json({ error: "Privacy policy link is required" });
      }
      try {
        new URL(privacyPolicyLink);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      console.log("[Privacy Policy API] Calling updateUserPrivacyPolicy...");
      const success = await updateUserPrivacyPolicy(userId, privacyPolicyLink);
      console.log("[Privacy Policy API] Update result:", success);
      if (!success) {
        return res.status(500).json({ error: "Failed to save privacy policy link" });
      }
      return res.json({ success: true, message: "Privacy policy link saved successfully" });
    } catch (error) {
      console.error("Error saving user privacy policy:", error);
      return res.status(500).json({ error: "Failed to save privacy policy link" });
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
      const result = await generateFormFromPrompt(validatedData.prompt);
      if (!result.config) {
        return res.status(500).json({ error: "Failed to generate form" });
      }
      const label = `Generated Form ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
      const savedFormId = await createFormConfig(
        label,
        result.config,
        "en",
        null,
        userId
      );
      await deductUserCredits(userId, 1);
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND ===");
      console.log(JSON.stringify({ id: savedFormId, config: result.config }, null, 2));
      console.log("=== END FORM CONFIGURATION ===");
      return res.json({
        id: savedFormId,
        config: result.config,
        error: result.error,
        fallbackReason: result.fallbackReason,
        usedFallback: !!result.error
      });
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
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND (API KEY) ===");
      console.log(JSON.stringify(formConfig2, null, 2));
      console.log("=== END FORM CONFIGURATION ===");
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
      const { prompt, domain, label, language, icon_mode } = req.body;
      console.log("\u{1F50D} API Request received:", {
        prompt: prompt ? `${prompt.substring(0, 50)}...` : "undefined",
        domain: domain || "undefined",
        label: label || "undefined",
        language: language || "undefined",
        icon_mode: icon_mode || "undefined"
      });
      if (!prompt) {
        return res.status(400).json({ error: "Missing required field: prompt" });
      }
      if (language && !["en", "de"].includes(language)) {
        return res.status(400).json({ error: "Language must be either 'en' or 'de'" });
      }
      if (icon_mode && !["lucide", "emoji", "none"].includes(icon_mode)) {
        return res.status(400).json({ error: "icon_mode must be one of: 'lucide', 'emoji', 'none'" });
      }
      const finalLanguage = language || "en";
      const finalIconMode = icon_mode || "lucide";
      const finalDomain = domain || `domain_${Math.random().toString(36).substring(2, 8)}`;
      let finalLabel = label;
      console.log("\u{1F3AF} Processing values:", {
        originalLabel: label,
        finalLabel,
        finalLanguage,
        finalDomain,
        finalIconMode
      });
      const formConfig2 = await generateFormFromPrompt(prompt);
      if (!formConfig2) {
        return res.status(500).json({ error: "Failed to generate form configuration." });
      }
      if (!finalLabel) {
        let firstTitle = "untitled";
        if (formConfig2 && Array.isArray(formConfig2.steps) && formConfig2.steps.length > 0 && formConfig2.steps[0].title) {
          firstTitle = String(formConfig2.steps[0].title).replace(/\s+/g, "_").toLowerCase();
        }
        finalLabel = firstTitle;
      }
      const isUnique = await checkUniqueFormProperties(
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
      console.log("\u{1F680} About to create form with parameters:", {
        finalLabel,
        finalLanguage,
        finalDomain,
        finalIconMode
      });
      console.log("\u{1F527} Using direct config object to avoid double-wrapping");
      const formId = await createFormConfig(
        finalLabel,
        formConfig2.config,
        finalLanguage,
        finalDomain,
        userId,
        finalIconMode
      );
      await deductUserCredits(userId, 1);
      const form = await getFormByProperties(finalLanguage, finalLabel, finalDomain);
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
      console.log("\u{1F50D} PUBLISH API - Received data:", {
        originalFormId,
        label: validatedData.label,
        iconMode: validatedData.iconMode,
        hasConfig: !!validatedData.config
      });
      if (originalFormId) {
        console.log("\u{1F504} PUBLISH API - Updating existing form:", {
          formId: originalFormId,
          iconMode: validatedData.iconMode || "lucide"
        });
        await updateFormConfig(originalFormId, {
          config: validatedData.config,
          label: validatedData.label,
          iconMode: validatedData.iconMode || "lucide"
        });
        const updatedForm = await getFormConfig(originalFormId);
        console.log("\u2705 PUBLISH API - Updated form retrieved:", {
          formId: updatedForm?.id,
          iconMode: updatedForm?.iconMode
        });
        return res.json(updatedForm);
      } else {
        const formData = {
          userId,
          label: validatedData.label,
          config: validatedData.config,
          language: validatedData.language,
          iconMode: validatedData.iconMode || "lucide"
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
  app2.put("/api/forms/icon-mode", async (req, res) => {
    try {
      const userId = req.session.user?.supabaseUserId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { formId, iconMode } = req.body;
      console.log("\u{1F3A8} ICON MODE API - Received request:", {
        userId,
        formId,
        iconMode,
        body: req.body
      });
      if (!formId || !iconMode || !["lucide", "emoji", "none"].includes(iconMode)) {
        console.log("\u274C ICON MODE API - Invalid request:", { formId, iconMode });
        return res.status(400).json({ error: "Invalid formId or iconMode" });
      }
      console.log("\u{1F504} ICON MODE API - Updating form config...");
      const success = await updateFormConfig(formId, {
        iconMode
      });
      console.log("\u2705 ICON MODE API - Update result:", { success });
      if (success) {
        return res.json({ success: true });
      } else {
        return res.status(500).json({ error: "Failed to update icon mode" });
      }
    } catch (error) {
      console.error("\u274C ICON MODE API - Error:", error);
      return res.status(500).json({ error: "Failed to update icon mode" });
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
      console.log(`[API] Fetching form by properties: language=${language}, label=${label}, domain=${domain}`);
      const form = await getFormByProperties(
        language,
        label,
        domain
      );
      if (!form) {
        console.log(`[API] Form not found for properties: language=${language}, label=${label}, domain=${domain}`);
        return res.status(404).json({ error: "Form not found" });
      }
      console.log(`[API] Form found with ID: ${form.id}`);
      console.log(`[API] Form config structure:`, {
        hasConfig: !!form.config,
        configType: typeof form.config,
        hasSteps: form.config && form.config.steps ? true : false,
        stepsType: form.config && form.config.steps ? typeof form.config.steps : "undefined",
        isStepsArray: form.config && form.config.steps ? Array.isArray(form.config.steps) : false,
        stepsLength: form.config && form.config.steps && Array.isArray(form.config.steps) ? form.config.steps.length : 0
      });
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
      if (modifiedForm.config && typeof modifiedForm.config === "object") {
        if (modifiedForm.config.steps && !Array.isArray(modifiedForm.config.steps) && typeof modifiedForm.config.steps === "object") {
          console.log(`[API] Converting steps object to array`);
          try {
            const keys = Object.keys(modifiedForm.config.steps).filter((k) => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
            if (keys.length > 0) {
              const stepsArray = keys.map((k) => modifiedForm.config.steps[k]);
              modifiedForm.config.steps = stepsArray;
              console.log(`[API] Successfully converted steps to array with length: ${stepsArray.length}`);
            }
          } catch (err) {
            console.error(`[API] Error converting steps to array:`, err);
          }
        }
      }
      console.log(`[API] Final form config structure before sending:`, {
        hasConfig: !!modifiedForm.config,
        hasSteps: modifiedForm.config && modifiedForm.config.steps ? true : false,
        isStepsArray: modifiedForm.config && modifiedForm.config.steps ? Array.isArray(modifiedForm.config.steps) : false,
        stepsLength: modifiedForm.config && modifiedForm.config.steps && Array.isArray(modifiedForm.config.steps) ? modifiedForm.config.steps.length : 0
      });
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
        console.log("[API] File details:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer?.length || 0
        });
        let extractedText = "";
        try {
          if (file.mimetype === "application/pdf") {
            console.log("[API] Processing PDF file");
            const pdfData = await parsePdf(file.buffer);
            extractedText = pdfData.text;
            console.log("[API] PDF text extracted, length:", extractedText.length);
          } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            console.log("[API] Processing Word document");
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
            console.log("[API] Word document text extracted, length:", extractedText.length);
          } else if (file.mimetype === "text/plain") {
            console.log("[API] Processing text file");
            extractedText = file.buffer.toString("utf-8");
            console.log("[API] Text file content extracted, length:", extractedText.length);
          } else if (file.mimetype.startsWith("image/")) {
            console.log("[API] Processing image file - no text extraction");
            extractedText = "";
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
        const documentUrl = await uploadDocumentToStorage(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        console.log("[API] Document uploaded and processed:", {
          fileName: file.originalname,
          fileSize: file.size,
          documentUrl,
          extractedTextLength: extractedText.length
        });
        const responseData = {
          documentUrl,
          extractedText
        };
        console.log("[API] Final response data being sent:", responseData);
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
    }
  );
  app2.post("/api/forms/:id/session", async (req, res) => {
    console.log("[Session] NEW session creation requested");
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }
      const form = await getFormConfig(formId);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      const sessionNo = await getNextSessionNumber(formId);
      const sessionId = await createFormSession(formId, sessionNo, {
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
    } catch (error) {
      console.error("[Session] Error creating new session:", error);
      return res.status(500).json({ error: error.message || "Failed to create session" });
    }
  });
  app2.patch("/api/sessions/:sessionId/temp-response", async (req, res) => {
    console.log("[Session] Temp response update requested");
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const { tempResponse } = req.body;
      if (!tempResponse || typeof tempResponse !== "object") {
        return res.status(400).json({ error: "Invalid temp response data" });
      }
      await updateTempResponse(sessionId, tempResponse);
      console.log(`[Session] Updated temp response for session ${sessionId}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("[Session] Error updating temp response:", error);
      return res.status(500).json({ error: error.message || "Failed to update temp response" });
    }
  });
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
      const { _sessionInfo, ...formResponses2 } = req.body;
      const sessionId = _sessionInfo?.sessionId;
      const sessionNo = _sessionInfo?.sessionNo;
      console.log(`[Form Submission] Session info received: sessionId=${sessionId}, sessionNo=${sessionNo}`);
      let savedResponseId;
      if (sessionId && sessionNo) {
        console.log(`[Form Submission] Attempting to complete existing session ${sessionId}`);
        const success = await completeFormSession(sessionId, formResponses2);
        if (success) {
          console.log(`[Form Submission] Successfully completed session ${sessionId}`);
          savedResponseId = sessionId;
        } else {
          console.log(`[Form Submission] Failed to complete session ${sessionId}, creating new response`);
          savedResponseId = await createFormResponse(
            form.label,
            formResponses2,
            form.language || "en",
            form.domain || null,
            formId,
            form.user_uuid || null
          );
        }
      } else {
        console.log(`[Form Submission] No session info provided, creating new response`);
        savedResponseId = await createFormResponse(
          form.label,
          formResponses2,
          form.language || "en",
          form.domain || null,
          formId,
          form.user_uuid || null
        );
      }
      console.log(`[Form Submission] Form response saved with ID ${savedResponseId} for formId ${formId}`);
      try {
        if (form.user_uuid) {
          const formCreator = await getUserById(form.user_uuid);
          if (formCreator && formCreator.CRM_webhook) {
            console.log(`[Form Submission] Sending webhook to ${formCreator.CRM_webhook}`);
            const webhookPayload = {
              event: "form_submission",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              form: {
                id: formId,
                label: form.label,
                language: form.language,
                domain: form.domain
              },
              response: {
                id: savedResponseId,
                data: formResponses2,
                sessionId,
                sessionNo
              },
              user: {
                id: form.user_uuid,
                email: formCreator.email
              }
            };
            fetch(formCreator.CRM_webhook, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "FormBuilder/1.0"
              },
              body: JSON.stringify(webhookPayload)
            }).catch((error) => {
              console.error(`[Form Submission] Webhook delivery failed:`, error);
            });
          }
        }
      } catch (webhookError) {
        console.error(`[Form Submission] Error processing webhook:`, webhookError);
      }
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
      console.log("[API] /api/generate-quotation called with:", {
        formResponses: formResponses2,
        documentData,
        contentPrompt,
        formId,
        stepTitle
      });
      console.log("[API] Full documentData object:", JSON.stringify(documentData, null, 2));
      console.log("[API] Full formResponses object:", JSON.stringify(formResponses2, null, 2));
      const isImage = documentData.documentUrl && (documentData.documentUrl.includes(".png") || documentData.documentUrl.includes(".jpg") || documentData.documentUrl.includes(".jpeg"));
      console.log("[API] Document type detection:", {
        isImage,
        documentUrl: documentData.documentUrl,
        hasDocumentContent: !!documentData.documentContent,
        documentContentLength: documentData.documentContent?.length || 0
      });
      const analysisResult = await analyzeDocument({
        formResponses: formResponses2,
        documentContent: documentData.documentContent,
        documentUrl: documentData.documentUrl,
        question: contentPrompt,
        isImage
      });
      console.log("[API] Gemini document analysis result:", analysisResult);
      console.log("[API] Analysis result details:", {
        success: analysisResult.success,
        answerLength: analysisResult.answer?.length || 0,
        answerPreview: analysisResult.answer?.substring(0, 200) + "...",
        error: analysisResult.error
      });
      if (formId) {
        const responses = await getFormResponsesByFormId(formId);
        const latestResponse = responses && responses.length > 0 ? responses[0] : null;
        if (latestResponse) {
          console.log("[API] Found existing response:", {
            responseId: latestResponse.id,
            responseKeys: Object.keys(latestResponse.response || {}),
            currentStepValue: latestResponse.response?.[stepTitle]
          });
          const updatedResponse = {
            ...latestResponse.response,
            [stepTitle]: analysisResult.answer || "Failed to analyze document."
          };
          console.log("[API] Updated response object:", {
            newStepValue: updatedResponse[stepTitle],
            allKeys: Object.keys(updatedResponse)
          });
          await createFormResponse(
            latestResponse.label,
            updatedResponse,
            latestResponse.language,
            latestResponse.domain,
            formId,
            latestResponse.user_uuid || null
          );
          console.log("[API] Document analysis saved in Supabase for formId", formId, "under key", stepTitle);
        } else {
          console.warn("[API] No existing form response found for formId", formId, ". Skipping Supabase save.");
        }
      } else {
        console.warn("[API] No formId provided. Skipping Supabase save.");
      }
      console.log("[API] Final response being sent to frontend:", { quotation: analysisResult.answer });
      res.json({ quotation: analysisResult.answer });
    } catch (error) {
      console.error("[API] Error analyzing document:", error);
      res.status(500).json({ quotation: "An error occurred while analyzing the document." });
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
var allowedOrigin = isProduction ? process.env.APP_URL || "https://formbuilder-v-9-final-2-partnerscaile.replit.app" : "http://localhost:5173";
console.log("CORS configuration:", {
  isProduction,
  allowedOrigin,
  nodeEnv: process.env.NODE_ENV
});
var corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    if (origin === allowedOrigin) {
      return callback(null, true);
    }
    if (!isProduction) {
      return callback(null, true);
    }
    if (origin === process.env.APP_URL) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};
app.use(cors(corsOptions));
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
if (isProduction || process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.path === "/embed" || req.path.startsWith("/embed?")) {
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Content-Security-Policy", "frame-ancestors http: https: data:");
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors http: https: data:`);
    }
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
}
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
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
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
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
