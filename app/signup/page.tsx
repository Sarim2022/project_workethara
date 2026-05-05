"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signup } from "@/app/actions/auth";
import Link from "next/link";
import { Briefcase, Info } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    
    try {
      await signup(formData);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4 font-sans">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md overflow-hidden rounded-3xl">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Join Workethara</CardTitle>
          <CardDescription className="text-balance">
            Create your account to start managing projects and team tasks.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required className="h-11 rounded-xl border-slate-200 focus:ring-primary" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Official Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@workspace.in or you@email.in" 
                required 
                className="h-11 rounded-xl border-slate-200 focus:ring-primary" 
              />
              <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl mt-2 border border-slate-100 dark:border-zinc-800">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  <p><span className="font-bold text-slate-700 dark:text-slate-300">@workspace.in</span> assigned as <span className="text-primary font-bold">Admin</span></p>
                  <p><span className="font-bold text-slate-700 dark:text-slate-300">@email.in</span> assigned as <span className="text-primary font-bold">Member</span></p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Secure Password</Label>
              <Input id="password" name="password" type="password" required className="h-11 rounded-xl border-slate-200 focus:ring-primary" />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 rounded-xl hover:scale-[1.02] transition-transform" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
