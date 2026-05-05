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
import { resetPassword } from "@/app/actions/auth";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      await resetPassword(formData);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 font-medium text-xs text-primary hover:text-primary/80 transition-colors">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl glass-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="items-center text-center">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Reset Password</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Enter your registered email and a new secure password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.in" required className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 focus:ring-primary" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
              <Input id="password" name="password" type="password" required className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 focus:ring-primary" />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center">Password updated successfully!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || success} className="w-full h-11 btn-primary-gradient rounded-xl font-bold tracking-wide">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CHANGE PASSWORD"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
