import type {
  GovernanceAgent,
  AgentContext,
  AgentResult,
} from "../agent.interface.js";
import type { ComplianceFinding } from "@helicarrier/shared";

const COPYLEFT_LICENSES = [
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "LGPL-2.1",
  "LGPL-3.0",
  "MPL-2.0",
  "EUPL-1.1",
  "EUPL-1.2",
];

const PERMISSIVE_LICENSES = [
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "Unlicense",
  "CC0-1.0",
];

export class LicenseComplianceAgent implements GovernanceAgent {
  id = "license-compliance";
  name = "License Compliance Checker";
  description =
    "Checks npm package licenses against enterprise compliance rules";

  async execute(context: AgentContext): Promise<AgentResult> {
    const findings: ComplianceFinding[] = [];
    let totalChecked = 0;
    let passCount = 0;

    for (const lib of context.libraries) {
      totalChecked++;
      try {
        const response = await fetch(
          `https://registry.npmjs.org/${encodeURIComponent(lib)}/latest`,
        );

        if (!response.ok) {
          findings.push({
            rule: "license-check",
            severity: "medium",
            message: `Could not fetch package info for "${lib}"`,
            details: { status: response.status },
          });
          continue;
        }

        const data = (await response.json()) as { license?: string };
        const license = data.license ?? "UNKNOWN";

        if (license === "UNKNOWN" || !license) {
          findings.push({
            rule: "license-unknown",
            severity: "high",
            message: `Package "${lib}" has no declared license`,
            details: { package: lib },
          });
        } else if (
          COPYLEFT_LICENSES.some(
            (l) => license.toUpperCase().includes(l.toUpperCase()),
          )
        ) {
          findings.push({
            rule: "license-copyleft",
            severity: "critical",
            message: `Package "${lib}" uses copyleft license: ${license}`,
            details: { package: lib, license },
          });
        } else if (
          PERMISSIVE_LICENSES.some(
            (l) => license.toUpperCase().includes(l.toUpperCase()),
          )
        ) {
          passCount++;
        } else {
          findings.push({
            rule: "license-review",
            severity: "medium",
            message: `Package "${lib}" has uncommon license: ${license}`,
            details: { package: lib, license },
          });
        }
      } catch {
        findings.push({
          rule: "license-check",
          severity: "low",
          message: `Failed to check license for "${lib}" (network error)`,
          details: { package: lib },
        });
      }
    }

    const hasCritical = findings.some((f) => f.severity === "critical");
    const hasHigh = findings.some((f) => f.severity === "high");
    const score =
      totalChecked > 0 ? Math.round((passCount / totalChecked) * 100) : 100;

    return {
      agentId: this.id,
      status: hasCritical ? "fail" : hasHigh ? "warning" : "pass",
      findings,
      score,
    };
  }
}

export const licenseComplianceAgent = new LicenseComplianceAgent();
