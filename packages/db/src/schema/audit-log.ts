import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_log", {
  id: varchar("id", { length: 21 }).primaryKey(),
  actorId: varchar("actor_id", { length: 21 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id", { length: 21 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
