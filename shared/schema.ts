import { pgTable, text, serial, integer, boolean, json, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  uuid: text("uuid").unique(), // This is the Supabase auth user ID
  api_key: text("api_key").unique().default(null),
  credits: text("credits"), // Adding credits column from migration
});

export const usersRelations = relations(users, ({ many }) => ({
  formConfigs: many(formConfig),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
  uuid: true,
  credits: true,
}).extend({
  uuid: z.string().optional(),
  email: z.string().email(),
  isAdmin: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Form Config Table
export const formConfig = pgTable("form_config", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  config: json("config"),
  domain: text("domain"),
  user_uuid: text("user_uuid").references(() => users.id), // Renamed to match RLS policies
  form_console: json("form_console").default('{}'),
  iconMode: text("icon_mode").default('lucide'), // Added icon mode column
});

export const formConfigRelations = relations(formConfig, ({ one, many }) => ({
  user: one(users, {
    fields: [formConfig.user_uuid],
    references: [users.id],
  }),
  responses: many(formResponses),
}));

export const insertFormConfigSchema = createInsertSchema(formConfig).pick({
  label: true,
  language: true,
  config: true,
  domain: true,
  user_uuid: true,
  form_console: true,
  iconMode: true,
});

export type InsertFormConfig = z.infer<typeof insertFormConfigSchema>;
export type FormConfig = typeof formConfig.$inferSelect;

// Form Responses Table
export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  response: json("response"),
  domain: text("domain"),
  form_config_id: integer("form_config_id").references(() => formConfig.id),
  user_uuid: text("user_uuid"), // Add user_uuid to link responses to users
});

export const formResponsesRelations = relations(formResponses, ({ one }) => ({
  formConfig: one(formConfig, {
    fields: [formResponses.form_config_id],
    references: [formConfig.id],
  }),
}));

export const insertFormResponseSchema = createInsertSchema(formResponses).pick({
  label: true,
  language: true,
  response: true,
  domain: true,
  form_config_id: true,
  user_uuid: true,
});

export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;
export type FormResponse = typeof formResponses.$inferSelect;

