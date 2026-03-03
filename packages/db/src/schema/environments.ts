import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const environments = pgTable("environments", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  config: jsonb("config").notNull().default({}),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
