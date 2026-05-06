"use client";

import { useTransition } from "react";
import { updateSprintTaskPhase, updateSprintTaskPhaseBackward } from "@/app/actions/features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { TaskStatus } from "@prisma/client";

interface SprintTaskPhaseButtonProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function SprintTaskPhaseButton({ taskId, currentStatus }: SprintTaskPhaseButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleNextPhase = () => {
    startTransition(async () => {
      try {
        await updateSprintTaskPhase(taskId);
      } catch (error) {
        console.error(error);
        alert("Failed to update phase");
      }
    });
  };

  const handlePreviousPhase = () => {
    startTransition(async () => {
      try {
        await updateSprintTaskPhaseBackward(taskId);
      } catch (error) {
        console.error(error);
        alert("Failed to update phase");
      }
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "PENDING": return "text-slate-500 border-slate-200 bg-slate-50";
      case "IN_PROGRESS": return "text-blue-600 border-blue-200 bg-blue-50";
      case "TESTING": return "text-amber-600 border-amber-200 bg-amber-50";
      case "DONE": return "text-emerald-600 border-emerald-200 bg-emerald-50";
      default: return "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90"
        onClick={handlePreviousPhase}
        disabled={isPending}
        title="Previous Phase"
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowLeft className="h-3 w-3" />
        )}
      </Button>
      <Badge variant="outline" className={`h-6 text-[8px] font-black uppercase tracking-wider px-2 shadow-sm ${getStatusColor(currentStatus)}`}>
        {currentStatus.replace("_", " ")}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90"
        onClick={handleNextPhase}
        disabled={isPending}
        title="Next Phase"
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowRight className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
