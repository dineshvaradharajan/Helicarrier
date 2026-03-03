import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { themes } from "./themes.js";

export const recipes = pgTable("recipes", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  version: varchar("version", { length: 50 }).notNull().default("1.0.0"),
  definition: jsonb("definition").notNull(),
  agentIds: jsonb("agent_ids").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  themeId: varchar("theme_id", { length: 21 }).references(() => themes.id),
  pipelineStages: jsonb("pipeline_stages").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
