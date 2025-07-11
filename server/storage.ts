import { 
  users, type User, type InsertUser,
  formConfig, type FormConfig, type InsertFormConfig,
  formResponses, type FormResponse, type InsertFormResponse
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Form Config methods
  createFormConfig(config: InsertFormConfig): Promise<FormConfig>;
  getFormConfig(id: number): Promise<FormConfig | undefined>;
  getFormConfigs(): Promise<FormConfig[]>;
  getUserFormConfigs(userId: string): Promise<FormConfig[]>; // Get forms by user ID
  deleteFormConfig(id: number): Promise<boolean>; // Delete a form config

  // Form Response methods
  createFormResponse(response: InsertFormResponse): Promise<FormResponse>;
  getFormResponses(): Promise<FormResponse[]>;
  getFormResponsesByLabel(label: string): Promise<FormResponse[]>;
  getFormResponsesByFormId(formId: number): Promise<FormResponse[]>; // Get responses for a specific form

  // Session store
  sessionStore: session.Store;

  getUserById(id: string): Promise<User | null>;
  addUserCredits(userId: string, credits: number): Promise<void>;
  deductUserCredits(userId: string, credits: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'session', // Table name for storing sessions
      createTableIfMissing: true, // Create table if it doesn't exist
    });
    console.log('PostgreSQL session store initialized');
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure we insert as an array of values
    const [user] = await db.insert(users).values([insertUser as any]).returning();
    return user;
  }

  async createFormConfig(insertConfig: InsertFormConfig): Promise<FormConfig> {
    const [config] = await db.insert(formConfig).values(insertConfig).returning();
    return config;
  }

  async getFormConfig(id: number): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfig).where(eq(formConfig.id, id));
    return config;
  }

  async getFormConfigs(): Promise<FormConfig[]> {
    return await db.select().from(formConfig);
  }

  async getUserFormConfigs(userId: string): Promise<FormConfig[]> {
    return await db.select().from(formConfig).where(eq(formConfig.user_uuid, userId));
  }

  async createFormResponse(insertResponse: InsertFormResponse): Promise<FormResponse> {
    const [response] = await db.insert(formResponses).values(insertResponse).returning();
    return response;
  }

  async getFormResponses(): Promise<FormResponse[]> {
    return await db.select().from(formResponses);
  }

  async getFormResponsesByLabel(label: string): Promise<FormResponse[]> {
    return await db.select().from(formResponses).where(eq(formResponses.label, label));
  }

  async getFormResponsesByFormId(formId: number): Promise<FormResponse[]> {
    return await db.select().from(formResponses).where(eq(formResponses.form_config_id, formId));
  }

  async deleteFormConfig(id: number): Promise<boolean> {
    try {
      const result = await db.delete(formConfig).where(eq(formConfig.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting form config with ID ${id}:`, error);
      return false;
    }
  }

    // Credit management functions
  async getUserById(uuid: string): Promise<User | null> {
    try {
      const results = await db.select().from(users).where(eq(users.uuid, uuid)).limit(1);
      return results[0] || null;
    } catch (error) {
      console.error('Error fetching user by UUID:', error);
      return null;
    }
  }

  async addUserCredits(userId: string, credits: number): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentCredits = parseInt(user.credits || '0', 10);
      const newCredits = currentCredits + credits;

      await db.update(users)
        .set({ credits: newCredits.toString() })
        .where(eq(users.uuid, userId));

      console.log(`Added ${credits} credits to user ${userId}. New total: ${newCredits}`);
    } catch (error) {
      console.error('Error adding credits to user:', error);
      throw error;
    }
  }

  async deductUserCredits(userId: string, credits: number): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const currentCredits = parseInt(user.credits || '0', 10);
      if (currentCredits < credits) {
        throw new Error('Insufficient credits');
      }

      const newCredits = currentCredits - credits;

      await db.update(users)
        .set({ credits: newCredits.toString() })
        .where(eq(users.uuid, userId));

      console.log(`Deducted ${credits} credits from user ${userId}. New total: ${newCredits}`);
    } catch (error) {
      console.error('Error deducting credits from user:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();