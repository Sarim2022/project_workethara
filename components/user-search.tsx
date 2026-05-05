"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserCheck, UserX, Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Since we can't run prisma directly on client, we need an action
import { searchUserByEmail } from "@/app/actions/tasks";

export function UserSearch() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ exists: boolean; name?: string | null; role?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setResult(null);
    try {
      const data = await searchUserByEmail(email);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Find User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Search by official email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full h-11 btn-primary-gradient rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
          </Button>

          {result && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${
              result.exists ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
            }`}>
              {result.exists ? (
                <>
                  <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">User Found</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{result.name || "Unnamed User"}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{result.role}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-red-500/20 rounded-full text-red-600">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Not Found</p>
                    <p className="text-[10px] text-slate-500 font-medium">This email is not registered in Workethara.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
