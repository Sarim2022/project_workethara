"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SprintTaskPhaseButton } from "@/components/sprint-task-phase-button";
import { updateSprintTaskPhase } from "@/app/actions/features";

interface MemberSprintTask {
  id: string;
  title: string;
  week: number;
  status: any;
  sprint: {
    project: {
      name: string;
    };
  };
}

export function MemberSprintCardList({ tasks }: { tasks: MemberSprintTask[] }) {
  const [isPending, startTransition] = useTransition();

  const handleCardTap = (taskId: string) => {
    startTransition(async () => {
      try {
        await updateSprintTaskPhase(taskId);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <Card className="glass-card rounded-2xl border-none shadow-lg">
      <CardContent className="p-4 space-y-3">
        {tasks.map((st) => (
          <div
            key={st.id}
            role="button"
            tabIndex={isPending ? -1 : 0}
            aria-disabled={isPending}
            onClick={() => handleCardTap(st.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleCardTap(st.id);
              }
            }}
            className="w-full cursor-pointer text-left rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 p-3 hover:border-primary/30 transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-70"
            title="Tap card to move next status"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-500 text-white border-none text-[8px] font-black px-1.5 h-4">WEEK {st.week}</Badge>
                  <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{st.sprint.project.name}</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate mt-1">{st.title}</p>
              </div>
              <div
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <SprintTaskPhaseButton taskId={st.id} currentStatus={st.status} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
