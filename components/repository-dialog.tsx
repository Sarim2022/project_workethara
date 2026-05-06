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
import { GitBranch, Loader2, CheckCircle2, Link as LinkIcon, X } from "lucide-react";
import { updateProjectRepo } from "@/app/actions/features";

interface RepositoryDialogProps {
  projects: { id: string, name: string }[];
}

export function RepositoryDialog({ projects }: RepositoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const projectId = formData.get("projectId") as string;
    const repoLink = formData.get("repoLink") as string;
    
    try {
      await updateProjectRepo(projectId, repoLink);
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
        <Button variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold border border-slate-700/20 hover:bg-slate-700/5">
          Our Codebase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center relative">
            <div className="p-3 bg-slate-700/10 rounded-2xl text-slate-700 mb-2">
              <GitBranch className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">Connect Codebase</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Project</Label>
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

            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Git Repository Link</Label>
              <div className="relative">
                <Input 
                  name="repoLink" 
                  placeholder="https://github.com/org/repo" 
                  required 
                  className="h-11 rounded-xl border-slate-200 pl-10" 
                />
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || success} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black tracking-widest uppercase">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> REPO LINKED</div> : "SAVE REPOSITORY"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
