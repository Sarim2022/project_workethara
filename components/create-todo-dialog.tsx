"use client";

import type { ReactNode } from "react";
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
import { Plus, ListTodo, Loader2, CheckCircle2 } from "lucide-react";
import { createPersonalTodo } from "@/app/actions/features";

export function CreateTodoDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    
    try {
      await createPersonalTodo(title);
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
        {trigger || (
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all border-slate-200">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
              <ListTodo className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Personal Todo</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Task Description</Label>
              <Input name="title" placeholder="e.g. Follow up with client regarding Q4" required className="h-11 rounded-xl border-slate-200" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || success} className="w-full h-12 btn-primary-gradient rounded-xl font-black tracking-widest uppercase">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4" /> : "ADD TODO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
