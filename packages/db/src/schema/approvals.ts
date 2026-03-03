import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { apps } from "./apps.js";

export const approvals = pgTable("approvals", {
  id: varchar("id", { length: 21 }).primaryKey(),
  appId: varchar("app_id", { length: 21 })
    .notNull()
    .references(() => apps.id),
  requesterId: varchar("requester_id", { length: 21 })
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  payload: jsonb("payload").notNull().default({}),
  resolverId: varchar("resolver_id", { length: 21 }).references(
    () => users.id,
  ),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
