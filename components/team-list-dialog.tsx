"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Mail, Shield, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamListDialogProps {
  members: { id: string; name: string | null; email: string }[];
}

export function TeamListDialog({ members }: TeamListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95">
          <Users className="mr-2 h-4 w-4 text-primary" /> My Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="h-5 w-5" />
            </div>
            Workethara Team
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {members.length === 0 ? (
            <div className="text-center py-10">
              <UserIcon className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">No team members registered yet.</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-zinc-800/50 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(member.name || member.email).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">
                      {member.name || "Unnamed Member"}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2 py-0.5">
                  ACTIVE
                </Badge>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
