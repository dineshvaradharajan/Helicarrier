import { z } from "zod";
import { ROLES } from "../constants/roles.js";
import {
  APP_STATUSES,
  APPROVAL_STATUSES,
  APPROVAL_TYPES,
  COMPLIANCE_STATUSES,
  ENVIRONMENT_TYPES,
  ENVIRONMENT_STATUSES,
} from "../constants/statuses.js";
import { PIPELINE_STAGE_TYPES } from "../constants/pipeline.js";
import { AI_PROVIDERS } from "../constants/providers.js";

// ── Users ──
export const userSchema = z.object({
  id: z.string(),
  externalId: z.string().nullable(),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(ROLES),
  apiKeyHash: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof userSchema>;

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(ROLES).default("developer"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ── Recipes ──
export const recipeLibraryRulesSchema = z.object({
  allowed: z.array(z.string()).default([]),
  denied: z.array(z.string()).default([]),
});

// ── Pipeline Stages ──
export const pipelineStageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(PIPELINE_STAGE_TYPES),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  config: z.record(z.unknown()).default({}),
});
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const recipeDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  stack: z.object({
    framework: z.string(),
    language: z.string().default("typescript"),
    styling: z.string().optional(),
    testing: z.string().optional(),
  }),
  libraries: recipeLibraryRulesSchema.default({}),
  agents: z.array(z.string()).default([]),
  scaffold: z
    .object({
      template: z.string().optional(),
      postCreate: z.array(z.string()).default([]),
    })
    .default({}),
  pipeline: z.array(pipelineStageSchema).default([]),
});
export type RecipeDefinition = z.infer<typeof recipeDefinitionSchema>;

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  definition: recipeDefinitionSchema,
  agentIds: z.array(z.string()),
  isActive: z.boolean(),
  themeId: z.string().nullable().optional(),
  pipelineStages: z.array(pipelineStageSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Recipe = z.infer<typeof recipeSchema>;

export const createRecipeSchema = z.object({
  name: z.string().min(1),
  version: z.string().default("1.0.0"),
  definition: recipeDefinitionSchema,
  agentIds: z.array(z.string()).default([]),
  themeId: z.string().nullable().optional(),
  pipelineStages: z.array(pipelineStageSchema).default([]),
});
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

// ── Themes ──
export const themeColorsSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  destructive: z.string(),
  border: z.string(),
  ring: z.string(),
  card: z.string(),
  radius: z.string().default("0.5rem"),
  fontFamily: z.string().default("Inter, system-ui, sans-serif"),
});
export type ThemeColors = z.infer<typeof themeColorsSchema>;

export const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  colors: themeColorsSchema,
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Theme = z.infer<typeof themeSchema>;

export const createThemeSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  colors: themeColorsSchema,
});
export type CreateThemeInput = z.infer<typeof createThemeSchema>;

// ── Settings ──
export const aiProviderConfigSchema = z.object({
  provider: z.enum(AI_PROVIDERS),
  model: z.string().optional(),
});
export type AiProviderConfig = z.infer<typeof aiProviderConfigSchema>;

export const settingSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  updatedAt: z.date(),
});
export type Setting = z.infer<typeof settingSchema>;

// ── Apps ──
export const appSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  recipeId: z.string(),
  status: z.enum(APP_STATUSES),
  resolvedConfig: z.record(z.unknown()).default({}),
  additionalLibs: z.array(z.string()).default([]),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type App = z.infer<typeof appSchema>;

export const createAppSchema = z.object({
  name: z.string().min(1),
  recipeId: z.string(),
});
export type CreateAppInput = z.infer<typeof createAppSchema>;

export const addLibSchema = z.object({
  appId: z.string(),
  library: z.string().min(1),
});
export type AddLibInput = z.infer<typeof addLibSchema>;

// ── Approvals ──
export const approvalSchema = z.object({
  id: z.string(),
  appId: z.string(),
  requesterId: z.string(),
  type: z.enum(APPROVAL_TYPES),
  status: z.enum(APPROVAL_STATUSES),
  payload: z.record(z.unknown()),
  resolverId: z.string().nullable(),
  resolvedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Approval = z.infer<typeof approvalSchema>;

export const resolveApprovalSchema = z.object({
  approvalId: z.string(),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});
export type ResolveApprovalInput = z.infer<typeof resolveApprovalSchema>;

// ── Compliance ──
export const complianceFindingSchema = z.object({
  rule: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ComplianceFinding = z.infer<typeof complianceFindingSchema>;

export const complianceCheckSchema = z.object({
  id: z.string(),
  appId: z.string(),
  agentId: z.string(),
  status: z.enum(COMPLIANCE_STATUSES),
  findings: z.array(complianceFindingSchema),
  score: z.number().min(0).max(100).nullable(),
  triggeredBy: z.string(),
  createdAt: z.date(),
});
export type ComplianceCheck = z.infer<typeof complianceCheckSchema>;

// ── Audit Log ──
export const auditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.date(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

// ── Environments ──
export const environmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(ENVIRONMENT_TYPES),
  provider: z.string(),
  config: z.record(z.unknown()).default({}),
  status: z.enum(ENVIRONMENT_STATUSES),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Environment = z.infer<typeof environmentSchema>;

export const createEnvironmentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(ENVIRONMENT_TYPES),
  provider: z.string().min(1),
  config: z.record(z.unknown()).default({}),
});
export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
