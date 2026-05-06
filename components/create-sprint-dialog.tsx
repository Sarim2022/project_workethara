"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { createSprint } from "@/app/actions/features";

interface CreateSprintDialogProps {
  projects: { id: string, name: string }[];
}

export function CreateSprintDialog({ projects }: CreateSprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState("2");
  const [weeks, setWeeks] = useState<{ id: number, tasks: string[] }[]>([
    { id: 1, tasks: [""] },
    { id: 2, tasks: [""] }
  ]);

  const updateWeeks = (val: string) => {
    setDuration(val);
    const count = parseInt(val);
    const newWeeks = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      tasks: [""]
    }));
    setWeeks(newWeeks);
  };

  const addTask = (weekId: number) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, tasks: [...w.tasks, ""] } : w));
  };

  const updateTask = (weekId: number, taskIdx: number, val: string) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { 
      ...w, 
      tasks: w.tasks.map((t, i) => i === taskIdx ? val : t) 
    } : w));
  };

  const removeTask = (weekId: number, taskIdx: number) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { 
      ...w, 
      tasks: w.tasks.filter((_, i) => i !== taskIdx) 
    } : w));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await createSprint(formData);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/5">
          START SPRINT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl glass-card custom-scrollbar">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Team Sprint</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Project</Label>
              <Select name="projectId" required>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Choose project workspace" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sprint Name</Label>
                <Input name="name" placeholder="e.g. Q4 Growth Cycle" required className="h-11 rounded-xl border-slate-200" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (Weeks)</Label>
                <Select name="duration" value={duration} onValueChange={updateWeeks}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1, 2, 3, 4].map(v => (
                      <SelectItem key={v} value={v.toString()}>{v} Week{v > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6 mt-4">
              {weeks.map(week => (
                <div key={week.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary">WEEK {week.id}</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addTask(week.id)} className="h-7 text-[10px] font-bold text-primary gap-1">
                      <Plus className="h-3 w-3" /> ADD TASK
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {week.tasks.map((task, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          name={`week-${week.id}-task-${idx}`}
                          value={task}
                          onChange={(e) => updateTask(week.id, idx, e.target.value)}
                          placeholder="Task title..."
                          className="h-9 text-xs rounded-lg bg-white dark:bg-zinc-900 border-slate-200"
                        />
                        {week.tasks.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeTask(week.id, idx)} className="h-9 w-9 text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || success} className="w-full h-12 btn-primary-gradient rounded-xl font-black tracking-widest uppercase">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> SPRINT CREATED</div> : "SAVE SPRINT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] ${variant === 'outline' ? 'border' : ''} ${className}`}>
      {children}
    </span>
  );
}
