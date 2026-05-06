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
  members: { id: string, name: string | null, email: string }[];
}

export function CreateSprintDialog({ projects, members }: CreateSprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState("2");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [weeks, setWeeks] = useState<{ id: number, tasks: { title: string, assigneeId: string }[] }[]>([
    { id: 1, tasks: [{ title: "", assigneeId: "" }] },
    { id: 2, tasks: [{ title: "", assigneeId: "" }] }
  ]);

  const updateWeeks = (val: string) => {
    setDuration(val);
    const count = parseInt(val);
    const newWeeks = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      tasks: [{ title: "", assigneeId: "" }]
    }));
    setWeeks(newWeeks);
  };

  const addTask = (weekId: number) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, tasks: [...w.tasks, { title: "", assigneeId: "" }] } : w));
  };

  const updateTaskTitle = (weekId: number, taskIdx: number, val: string) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { 
      ...w, 
      tasks: w.tasks.map((t, i) => i === taskIdx ? { ...t, title: val } : t) 
    } : w));
  };

  const updateTaskAssignee = (weekId: number, taskIdx: number, val: string) => {
    setWeeks(prev => prev.map(w => w.id === weekId ? { 
      ...w, 
      tasks: w.tasks.map((t, i) => i === taskIdx ? { ...t, assigneeId: val } : t) 
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
    formData.set("projectId", selectedProjectId);
    try {
      await createSprint(formData);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        // Reset
        setSelectedProjectId("");
        setDuration("2");
        setWeeks([
          { id: 1, tasks: [{ title: "", assigneeId: "" }] },
          { id: 2, tasks: [{ title: "", assigneeId: "" }] }
        ]);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/5">
          START SPRINT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl glass-card custom-scrollbar">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Team Sprint</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Project</Label>
                <Select name="projectId" value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue>
                      {selectedProject ? selectedProject.name : "Choose project"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CR ID (Numeric)</Label>
                <Input name="crId" type="number" placeholder="e.g. 1024" className="h-11 rounded-xl border-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sprint Name</Label>
                <Input name="name" placeholder="e.g. Q4 Growth Cycle" required className="h-11 rounded-xl border-slate-200" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (Weeks)</Label>
                <Select name="duration" value={duration} onValueChange={(val) => val && updateWeeks(val)}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue>
                      {duration} Week{parseInt(duration) > 1 ? "s" : ""}
                    </SelectValue>
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
                  <div className="space-y-3">
                    {week.tasks.map((task, idx) => {
                      const selectedAssignee = members.find(m => m.id === task.assigneeId);
                      return (
                        <div key={idx} className="flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm relative group">
                          <div className="flex gap-2">
                            <Input 
                              name={`week-${week.id}-task-${idx}`}
                              value={task.title}
                              onChange={(e) => updateTaskTitle(week.id, idx, e.target.value)}
                              placeholder="Task title..."
                              className="h-9 text-xs rounded-lg border-slate-200 flex-1"
                            />
                            {week.tasks.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeTask(week.id, idx)} className="h-9 w-9 text-slate-400 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-[9px] font-black uppercase text-slate-400 shrink-0">Assignee:</Label>
                            <Select 
                              name={`week-${week.id}-task-${idx}-assignee`} 
                              value={task.assigneeId} 
                              onValueChange={(val) => updateTaskAssignee(week.id, idx, val)}
                            >
                              <SelectTrigger className="h-8 text-[10px] rounded-lg border-slate-100 bg-slate-50/50">
                                <SelectValue>
                                  {selectedAssignee ? (selectedAssignee.name || selectedAssignee.email.split('@')[0]) : "Assign to member..."}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {members.map(m => (
                                  <SelectItem key={m.id} value={m.id} className="text-xs">
                                    {m.name || m.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
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
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${variant === 'outline' ? 'border' : ''} ${className}`}>
      {children}
    </span>
  );
}
