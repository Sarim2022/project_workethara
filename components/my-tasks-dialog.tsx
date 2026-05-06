"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListTodo, ClipboardList, User as UserIcon, Trash2 } from "lucide-react";
import { TaskPhaseButton } from "@/components/task-phase-button";
import { deletePersonalTodo } from "@/app/actions/features";
import { updateTaskPhase, updateTaskStatus } from "@/app/actions/tasks";
import { useState } from "react";
import { TaskStatus } from "@prisma/client";

interface MyTasksDialogProps {
  tasks: any[];
  currentUserId: string;
  personalTodos: any[];
  isAdmin?: boolean;
}

export function MyTasksDialog({ tasks, currentUserId, personalTodos = [], isAdmin = false }: MyTasksDialogProps) {
  const [loadingTodo, setLoadingTodo] = useState<string | null>(null);

  // Filter tasks assigned to the current user
  const myTasks = tasks.filter(task => task.assigneeId === currentUserId);
  const assignedMemberTasks = tasks.filter(
    (task) => Boolean(task.assigneeId) && task.assigneeId !== currentUserId
  );

  const handleDeleteTodo = async (id: string) => {
    setLoadingTodo(id);
    try {
      await deletePersonalTodo(id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTodo(null);
    }
  };

  const handleTaskCardTap = async (taskId: string) => {
    try {
      await updateTaskPhase(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdminCheckbox = async (taskId: string, checked: boolean) => {
    try {
      await updateTaskStatus(taskId, checked ? TaskStatus.DONE : TaskStatus.PENDING);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95">
          <ListTodo className="mr-2 h-4 w-4 text-primary" /> My Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl glass-card custom-scrollbar max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            My Productivity Board
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-8 space-y-8">
          {/* Section: Personal Todos */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <UserIcon className="h-3 w-3" /> Personal Todos
            </h3>
            <div className="space-y-3">
              {personalTodos.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No personal tasks yet. Use the (+) icon to add one.</p>
              ) : (
                personalTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 group">
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {todo.title}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={loadingTodo === todo.id}
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Assigned Tasks */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="h-3 w-3" /> Official Assignments
            </h3>
            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold uppercase">No active assignments</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr] gap-3 px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Task</span>
                    <span>Project</span>
                    <span>Due</span>
                    <span>Status</span>
                  </div>
                  {myTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskCardTap(task.id)}
                      className="w-full text-left grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr] gap-3 items-center p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-zinc-800/50 hover:border-primary/30 transition-all"
                      title="Tap task row to move next status"
                    >
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-500/10 px-1.5 py-0.5 rounded w-fit truncate">
                        {task.project.name}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                      </span>
                      <div onClick={(event) => event.stopPropagation()}>
                        <TaskPhaseButton taskId={task.id} currentStatus={task.status} />
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Section: Admin Assigned Member Tasks */}
          {isAdmin && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="h-3 w-3" /> Assigned Member Tasks
              </h3>
              <div className="space-y-3">
                {assignedMemberTasks.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase">No member assignments yet</p>
                  </div>
                ) : (
                  assignedMemberTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-zinc-800/50">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
                          {task.assignee?.name || task.assignee?.email?.split("@")[0] || "Member"} - {task.project.name}
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
                        <input
                          type="checkbox"
                          checked={task.status === TaskStatus.DONE}
                          onChange={(e) => handleAdminCheckbox(task.id, e.target.checked)}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        />
                        Done
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
