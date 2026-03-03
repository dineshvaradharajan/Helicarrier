import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const themes = pgTable("themes", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  colors: jsonb("colors").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
