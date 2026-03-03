export const APP_STATUSES = [
  "draft",
  "pending_approval",
  "active",
  "archived",
] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const APPROVAL_TYPES = [
  "app_creation",
  "library_addition",
  "config_change",
] as const;
export type ApprovalType = (typeof APPROVAL_TYPES)[number];

export const COMPLIANCE_STATUSES = [
  "pass",
  "fail",
  "warning",
  "error",
] as const;
export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export const ENVIRONMENT_TYPES = ["dev", "staging", "prod"] as const;
export type EnvironmentType = (typeof ENVIRONMENT_TYPES)[number];

export const ENVIRONMENT_STATUSES = [
  "active",
  "inactive",
  "provisioning",
] as const;
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUSES)[number];
