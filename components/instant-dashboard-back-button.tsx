"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstantDashboardBackButton() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-slate-500 hover:text-primary"
      onClick={() => router.push("/dashboard")}
      type="button"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Dashboard
    </Button>
  );
}
