import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, users } from "@helicarrier/db";
import {
  type CreateUserInput,
  type User,
  type Role,
  NotFoundError,
  ConflictError,
  createUserSchema,
} from "@helicarrier/shared";

export class UserService {
  async create(input: CreateUserInput): Promise<User> {
    const parsed = createUserSchema.parse(input);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(`User with email ${parsed.email} already exists`);
    }

    const id = nanoid();
    const [user] = await db
      .insert(users)
      .values({
        id,
        email: parsed.email,
        displayName: parsed.displayName,
        role: parsed.role,
      })
      .returning();

    return user as unknown as User;
  }

  async list(): Promise<User[]> {
    const result = await db.select().from(users);
    return result as unknown as User[];
  }

  async getById(id: string): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    return user as unknown as User;
  }

  async assignRole(userId: string, role: Role): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return user as unknown as User;
  }
}

export const userService = new UserService();
