export const PIPELINE_STAGE_TYPES = [
  "uat",
  "iso_27001",
  "hipaa",
  "gdpr",
  "soc_1",
  "soc_2",
  "security_testing",
  "pen_testing",
  "custom",
] as const;

export type PipelineStageType = (typeof PIPELINE_STAGE_TYPES)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStageType, string> = {
  uat: "User Acceptance Testing",
  iso_27001: "ISO 27001",
  hipaa: "HIPAA",
  gdpr: "GDPR",
  soc_1: "SOC 1",
  soc_2: "SOC 2",
  security_testing: "Security Testing",
  pen_testing: "Penetration Testing",
  custom: "Custom",
};
