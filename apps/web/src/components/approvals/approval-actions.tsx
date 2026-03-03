"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resolve(status: "approved" | "rejected") {
    setLoading(true);
    try {
      await fetch(`/api/v1/approvals/${approvalId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => resolve("approved")}
        disabled={loading}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => resolve("rejected")}
        disabled={loading}
        className="text-destructive hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
      >
        Reject
      </Button>
    </div>
  );
}
