"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/app/actions/tasks";
import { Plus, Calendar } from "lucide-react";
import { Role } from "@prisma/client";

interface CreateProjectDialogProps {
  userRole: Role;
}

export function CreateProjectDialog({ userRole }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (userRole !== Role.ADMIN) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      await createProject(formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md border-muted">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Create Project</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define a new project and set a completion deadline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Project Name</Label>
              <Input id="name" name="name" placeholder="e.g., Marketing Q2" required className="h-10" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Input id="description" name="description" placeholder="Project goals..." className="h-10" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientDetails" className="text-sm font-medium">Client Details</Label>
              <Input id="clientDetails" name="clientDetails" placeholder="Client name, contact info..." className="h-10" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Deadline
              </Label>
              <Input id="deadline" name="deadline" type="date" required className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto shadow-lg shadow-primary/20">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
