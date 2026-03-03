import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, users } from "@helicarrier/db";
import {
  AuthenticationError,
  NotFoundError,
  type User,
} from "@helicarrier/shared";

export class AuthService {
  async validateApiKey(apiKey: string): Promise<User> {
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.apiKeyHash, hash))
      .limit(1);

    if (!user) {
      throw new AuthenticationError("Invalid API key");
    }

    return user as unknown as User;
  }

  async generateApiKey(userId: string): Promise<string> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const apiKey = `hc_${nanoid(32)}`;
    const hash = crypto.createHash("sha256").update(apiKey).digest("hex");

    await db
      .update(users)
      .set({ apiKeyHash: hash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return apiKey;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return (user as unknown as User) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return (user as unknown as User) ?? null;
  }
}

export const authService = new AuthService();
