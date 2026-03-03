import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { apps } from "./apps.js";

export const complianceChecks = pgTable("compliance_checks", {
  id: varchar("id", { length: 21 }).primaryKey(),
  appId: varchar("app_id", { length: 21 })
    .notNull()
    .references(() => apps.id),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  findings: jsonb("findings").notNull().default([]),
  score: integer("score"),
  triggeredBy: varchar("triggered_by", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
