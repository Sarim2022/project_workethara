"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTodoDialog } from "@/components/create-todo-dialog";
import { MyTasksDialog } from "@/components/my-tasks-dialog";
import { TaskPhaseButton } from "@/components/task-phase-button";
import { CheckSquare, GitBranch, AlertTriangle, ExternalLink, Plus, Zap } from "lucide-react";
import { TaskStatus } from "@prisma/client";

interface MemberQuickActionsProps {
  tasks: MemberTask[];
  personalTodos: PersonalTodo[];
  sprints: AssignedSprint[];
  issues: AssignedIssue[];
  repositories: {
    id: string;
    name: string;
    repoLink: string | null;
    repoAdminId: string | null;
  }[];
  currentUserId: string;
}

interface MemberTask {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  status: TaskStatus;
  dueDate: Date | string | null;
  project: { name: string };
  assignee?: { name: string | null; email: string } | null;
}

interface PersonalTodo {
  id: string;
  title: string;
}

interface AssignedSprintTask {
  id: string;
  title: string;
  week: number;
  status: TaskStatus;
}

interface AssignedSprint {
  id: string;
  name: string;
  crId: number | null;
  project: { name: string };
  tasks: AssignedSprintTask[];
}

interface AssignedIssue {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  project: { name: string };
}

const QuickActionButton = React.forwardRef<HTMLButtonElement, ButtonProps & {
  icon: React.ReactNode;
  label: string;
  tone: string;
}>(({ icon, label, tone, className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      className={`h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 px-4 text-[11px] font-black uppercase tracking-tight shadow-md hover:bg-white dark:hover:bg-zinc-800 active:scale-95 ${className || ""}`}
      {...props}
    >
      <span className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-xl ${tone}`}>
        {icon}
      </span>
      {label}
    </Button>
  );
});
QuickActionButton.displayName = "QuickActionButton";

export function MemberQuickActions({
  tasks,
  personalTodos,
  sprints,
  issues,
  repositories,
  currentUserId
}: MemberQuickActionsProps) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-2 overflow-x-auto pb-1">
      <Dialog>
        <DialogTrigger asChild>
          <QuickActionButton
            icon={<Zap className="h-3.5 w-3.5" />}
            label="My Sprint"
            tone="bg-blue-500/10 text-blue-500"
          />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[560px] rounded-3xl border-none shadow-2xl glass-card custom-scrollbar max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Zap className="h-5 w-5" />
              </span>
              My Active Sprints
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 space-y-3">
            {sprints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-xs font-bold uppercase text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                No active sprint assignments
              </div>
            ) : (
              sprints.map((sprint) => (
                <div key={sprint.id} className="rounded-2xl border border-slate-100 bg-white/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{sprint.name}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">{sprint.project.name}</p>
                    </div>
                    <Badge className="border-none bg-blue-500/10 text-[9px] font-black uppercase text-blue-500">
                      CR {sprint.crId || "N/A"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    {sprint.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-zinc-800/60">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{task.title}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Week {task.week}</p>
                        </div>
                        <TaskPhaseButton taskId={task.id} currentStatus={task.status} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <QuickActionButton
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label="My Issues"
            tone="bg-amber-500/10 text-amber-500"
          />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[560px] rounded-3xl border-none shadow-2xl glass-card custom-scrollbar max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              My Team Issues
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 space-y-3">
            {issues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-xs font-bold uppercase text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                No admin-assigned issues
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-3 rounded-2xl border border-slate-100 bg-white/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">{issue.title}</p>
                    <p className="truncate text-[10px] font-bold uppercase text-slate-400">
                      {issue.description || "No description"}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-[9px] font-black uppercase text-primary">
                    {issue.project.name}
                  </Badge>
                  <TaskPhaseButton taskId={issue.id} currentStatus={issue.status as TaskStatus} />
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {repositories.length === 1 && repositories[0].repoLink ? (
        <Button
          asChild
          variant="outline"
          className="h-12 rounded-2xl border-slate-200 bg-white/80 px-4 text-[11px] font-black uppercase tracking-tight shadow-md hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800"
        >
          <a href={repositories[0].repoLink} target="_blank" rel="noopener noreferrer">
            <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500">
              <GitBranch className="h-3.5 w-3.5" />
            </span>
            Joined Repo
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <QuickActionButton
              icon={<GitBranch className="h-3.5 w-3.5" />}
              label="Joined Repo"
              tone="bg-slate-500/10 text-slate-500"
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl glass-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <span className="p-2 bg-slate-500/10 rounded-xl text-slate-500">
                  <GitBranch className="h-5 w-5" />
                </span>
                Joined Repositories
              </DialogTitle>
            </DialogHeader>
            <div className="mt-5 space-y-3">
              {repositories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-xs font-bold uppercase text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                  No repository connected yet
                </div>
              ) : (
                repositories.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.repoLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/50 p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03] dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">{repo.name}</p>
                      <p className="truncate text-[10px] font-bold text-slate-400">{repo.repoLink}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.repoAdminId === currentUserId && (
                        <Badge className="border-none bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-600">
                          Team Admin
                        </Badge>
                      )}
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <MyTasksDialog
        tasks={tasks}
        currentUserId={currentUserId}
        personalTodos={personalTodos}
        trigger={
          <QuickActionButton
            icon={<CheckSquare className="h-3.5 w-3.5" />}
            label="My Task"
            tone="bg-emerald-500/10 text-emerald-600"
          />
        }
      />

      <CreateTodoDialog
        trigger={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-slate-200 bg-white/80 shadow-md hover:bg-white hover:scale-105 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800"
            title="Create Todo"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />
    </div>
  );
}
