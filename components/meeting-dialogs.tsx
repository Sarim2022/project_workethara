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
import { Video, Users, Loader2, CheckCircle2, Link as LinkIcon, Send } from "lucide-react";
import { createMeetingRoom } from "@/app/actions/features";

export function JoinRoomDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold border border-rose-500/20 hover:bg-rose-500/5">
          JOIN ROOM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <DialogHeader className="items-center text-center">
          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 mb-2">
            <Video className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">Join Meeting</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Meeting Link</Label>
            <div className="relative">
              <Input placeholder="Enter Google Meet or Zoom link" className="h-11 rounded-xl border-slate-200 pl-10" />
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full h-11 btn-primary-gradient rounded-xl font-bold" onClick={() => setOpen(false)}>
            ENTER ROOM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const userCount = parseInt(formData.get("userCount") as string);
    
    try {
      await createMeetingRoom(name, userCount);
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
        <Button variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400">
          CREATE ROOM
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 mb-2">
              <Video className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Meeting Room</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Room Name</Label>
              <Input name="name" placeholder="e.g. Daily Standup" required className="h-11 rounded-xl border-slate-200" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Participants</Label>
              <div className="relative">
                <Input name="userCount" type="number" defaultValue="5" required className="h-11 rounded-xl border-slate-200 pl-10" />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || success} className="w-full h-12 btn-primary-gradient rounded-xl font-black tracking-widest uppercase gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4" /> : <><Send className="h-4 w-4" /> SEND LINK</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
