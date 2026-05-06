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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/app/actions/tasks";
import { Plus, FolderOpen, User as UserIcon } from "lucide-react";

interface CreateTaskDialogProps {
  projects: { id: string; name: string }[];
  members: { id: string; name: string | null; email: string; teamName?: string }[];
}

export function CreateTaskDialog({ projects, members }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Controlled State for Selections (updated to allow null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>("unassigned");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(event.currentTarget);
    // Explicitly set the controlled values to ensure they are sent (handling nulls)
    formData.set("projectId", selectedProjectId || "");
    formData.set("assigneeId", selectedAssigneeId || "unassigned");

    try {
      await createTask(formData);
      setOpen(false);
      // Reset state
      setSelectedProjectId(null);
      setSelectedAssigneeId("unassigned");
    } catch (error: any) {
      setError(error.message || "Failed to create task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Find names for display
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedMember = members.find(m => m.id === selectedAssigneeId);
  const assignmentLocked = members.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md border-muted">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">New Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new task and assign it to a team member.
            </DialogDescription>
            {assignmentLocked && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                Assignment lock: create at least one team in My Team before assigning members.
              </p>
            )}
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input id="title" name="title" placeholder="What needs to be done?" required className="focus-visible:ring-primary" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Project Selection */}
              <div className="grid gap-2">
                <Label htmlFor="projectId" className="text-sm font-medium">Project</Label>
                <Select 
                  name="projectId" 
                  value={selectedProjectId ?? undefined} 
                  onValueChange={(val) => setSelectedProjectId(val)}
                  required
                >
                  <SelectTrigger className="focus:ring-primary overflow-hidden">
                    <SelectValue>
                      {selectedProject ? (
                        <div className="flex items-center gap-2 truncate">
                          <FolderOpen className="h-3 w-3 text-primary/60 shrink-0" />
                          <span className="truncate">{selectedProject.name}</span>
                        </div>
                      ) : "Select project"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[130] bg-background">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Selection */}
              <div className="grid gap-2">
                <Label htmlFor="assigneeId" className="text-sm font-medium">Assign To</Label>
                <Select 
                  name="assigneeId" 
                  value={selectedAssigneeId ?? undefined} 
                  onValueChange={(val) => setSelectedAssigneeId(val)}
                  disabled={assignmentLocked}
                >
                  <SelectTrigger className="focus:ring-primary overflow-hidden">
                    <SelectValue>
                      {selectedAssigneeId === "unassigned" ? (
                        "Unassigned"
                      ) : selectedMember ? (
                        <div className="flex items-center gap-2 truncate">
                          <UserIcon className="h-3 w-3 text-primary/60 shrink-0" />
                          <span className="truncate">{selectedMember.name || selectedMember.email.split('@')[0]}</span>
                        </div>
                      ) : "Select member"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[130] bg-background">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {(member.name || member.email.split('@')[0]) + (member.teamName ? ` (${member.teamName})` : "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select name="status" defaultValue="PENDING">
                  <SelectTrigger className="focus:ring-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[130] bg-background">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="TESTING">Testing</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                <Select name="priority" defaultValue="MEDIUM">
                  <SelectTrigger className="focus:ring-primary">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="z-[130] bg-background">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" className="focus-visible:ring-primary" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || (assignmentLocked && selectedAssigneeId !== "unassigned")} className="w-full sm:w-auto shadow-lg shadow-primary/20">
              {loading ? "Creating..." : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
