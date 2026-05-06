"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListTodo, CheckCircle2, Clock, PlayCircle, ClipboardList, User as UserIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/prisma/generated-client";
import { deletePersonalTodo } from "@/app/actions/features";
import { useState } from "react";

interface MyTasksDialogProps {
  tasks: any[];
  currentUserId: string;
  personalTodos: any[];
}

export function MyTasksDialog({ tasks, currentUserId, personalTodos = [] }: MyTasksDialogProps) {
  const [loadingTodo, setLoadingTodo] = useState<string | null>(null);

  // Filter tasks assigned to the current user
  const myTasks = tasks.filter(task => task.assigneeId === currentUserId);

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return { 
          icon: <CheckCircle2 className="h-3 w-3" />, 
          class: "bg-emerald-600 text-white border-transparent shadow-sm", 
          label: "DONE" 
        };
      case TaskStatus.TESTING:
        return { 
          icon: <ClipboardList className="h-3 w-3" />, 
          class: "bg-amber-500 text-white border-transparent shadow-sm", 
          label: "TESTING" 
        };
      case TaskStatus.IN_PROGRESS:
        return { 
          icon: <PlayCircle className="h-3 w-3" />, 
          class: "bg-blue-600 text-white border-transparent shadow-sm", 
          label: "IN PROGRESS" 
        };
      default:
        return { 
          icon: <Clock className="h-3 w-3" />, 
          class: "bg-slate-200 text-slate-700 border-transparent", 
          label: "TO DO" 
        };
    }
  };

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
                myTasks.map((task) => {
                  const config = getStatusConfig(task.status);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-zinc-800/50 hover:border-primary/30 transition-all group">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-500/10 px-1.5 py-0.5 rounded">
                            {task.project.name}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                          {task.title}
                        </h4>
                      </div>
                      <Badge className={`flex items-center gap-2 text-[10px] font-black tracking-wider px-3 py-1 rounded-md ${config.class}`}>
                        {config.label}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
