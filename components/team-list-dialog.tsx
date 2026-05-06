"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Mail, User as UserIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createTeam, getAdminTeams } from "@/app/actions/teams";

interface TeamListDialogProps {
  initialTeams: {
    id: string;
    teamName: string;
    members: {
      id: string;
      userEmail: string;
      userId: string;
      user: { id: string; email: string; name: string | null };
    }[];
  }[];
}

export function TeamListDialog({ initialTeams }: TeamListDialogProps) {
  const [teams, setTeams] = useState(initialTeams);
  const [teamName, setTeamName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const hasTeams = teams.length > 0;
  const parsedEmails = useMemo(
    () => memberEmails.split(",").map((email) => email.trim()).filter(Boolean),
    [memberEmails]
  );

  const handleCreateTeam = async () => {
    setLoading(true);
    setError("");
    try {
      await createTeam(teamName, parsedEmails);
      const freshTeams = await getAdminTeams();
      setTeams(freshTeams as any);
      setTeamName("");
      setMemberEmails("");
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95">
          <Users className="mr-2 h-4 w-4 text-primary" /> My Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] rounded-3xl border-none shadow-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="h-5 w-5" />
            </div>
            My Team Management
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create and manage teams for member assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
          {!hasTeams ? (
            <div className="rounded-2xl border border-dashed border-primary/30 p-5 bg-primary/5">
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">Create Your Team</p>
              <p className="text-xs text-slate-500 mt-1">You must create a team before assigning tasks.</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Team Name</label>
                  <Input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="e.g. Alpha Squad" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Add Members by Email</label>
                  <Input
                    value={memberEmails}
                    onChange={(event) => setMemberEmails(event.target.value)}
                    placeholder="a@email.in, b@email.in"
                  />
                  <p className="text-[10px] text-slate-400">Use comma-separated emails.</p>
                </div>
                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Create Another Team</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" />
                  <Input
                    value={memberEmails}
                    onChange={(event) => setMemberEmails(event.target.value)}
                    placeholder="member1@email.in, member2@email.in"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              </div>
              {teams.map((team) => (
                <div key={team.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 bg-white/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-sm">{team.teamName}</h4>
                    <Badge className="text-[9px] font-black">{team.members.length} MEMBERS</Badge>
                  </div>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{member.userId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{member.userEmail}</span>
                        </div>
                      </div>
                    ))}
                    {team.members.length === 0 && (
                      <p className="text-xs text-slate-400">No members yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleCreateTeam}
            disabled={loading || !teamName.trim() || parsedEmails.length === 0}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Saving..." : "Save Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
