"use client";

import { useTransition } from "react";
import { updateTaskPhase, updateTaskPhaseBackward } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import { TaskStatus } from "@prisma/client";

interface TaskPhaseButtonProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function TaskPhaseButton({ taskId, currentStatus }: TaskPhaseButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleNextPhase = () => {
    startTransition(async () => {
      try {
        await updateTaskPhase(taskId);
      } catch (error) {
        console.error(error);
        alert("Failed to update phase");
      }
    });
  };

  const handlePreviousPhase = () => {
    startTransition(async () => {
      try {
        await updateTaskPhaseBackward(taskId);
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
        className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90"
        onClick={handlePreviousPhase}
        disabled={isPending}
        title="Previous Phase"
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowLeft className="h-3.5 w-3.5" />
        )}
      </Button>
      <Badge variant="outline" className={`h-7 text-[10px] font-bold uppercase tracking-wider px-2 shadow-sm ${getStatusColor(currentStatus)}`}>
        {currentStatus.replace("_", " ")}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90"
        onClick={handleNextPhase}
        disabled={isPending}
        title="Next Phase"
      >
        {isPending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
