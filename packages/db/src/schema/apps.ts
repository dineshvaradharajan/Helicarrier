import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { recipes } from "./recipes.js";

export const apps = pgTable("apps", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  recipeId: varchar("recipe_id", { length: 21 })
    .notNull()
    .references(() => recipes.id),
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  resolvedConfig: jsonb("resolved_config").notNull().default({}),
  additionalLibs: jsonb("additional_libs").notNull().default([]),
  ownerId: varchar("owner_id", { length: 21 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
