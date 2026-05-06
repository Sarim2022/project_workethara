"use client";

import { useTransition } from "react";
import { TaskStatus } from "@/prisma/generated-client";
import { updateTaskStatus } from "@/app/actions/tasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: TaskStatus;
}

export function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    
    startTransition(async () => {
      await updateTaskStatus(taskId, value as TaskStatus);
    });
  };

  return (
    <Select
      defaultValue={initialStatus ?? undefined}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[140px] h-8 text-xs focus:ring-0 focus:ring-offset-0 border-zinc-200 dark:border-zinc-800">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">
          <Badge variant="outline" className="font-normal text-zinc-500 border-zinc-200">Pending</Badge>
        </SelectItem>
        <SelectItem value="IN_PROGRESS">
          <Badge variant="outline" className="font-normal text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">In Progress</Badge>
        </SelectItem>
        <SelectItem value="TESTING">
          <Badge variant="outline" className="font-normal text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">Testing</Badge>
        </SelectItem>
        <SelectItem value="DONE">
          <Badge variant="outline" className="font-normal text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">Done</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
