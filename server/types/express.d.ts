import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, "id" | "uuid" | "email" | "username">;
    }
  }
}
