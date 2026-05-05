"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/app/actions/auth";
import Link from "next/link";
import { Briefcase, ShieldCheck, User as UserIcon } from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>(Role.MEMBER);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    // Domain Validation based on selected role
    if (selectedRole === Role.ADMIN && !email.endsWith("@workspace.in")) {
      setError("Admins must use @workspace.in emails.");
      setLoading(false);
      return;
    }
    if (selectedRole === Role.MEMBER && !email.endsWith("@email.in")) {
      setError("Members must use @email.in emails.");
      setLoading(false);
      return;
    }

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Workethara Portal</CardTitle>
          <CardDescription>
            Select your role and enter your credentials.
          </CardDescription>
        </CardHeader>
        
        {/* Role Selection Portal */}
        <div className="px-6 grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedRole(Role.ADMIN)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              selectedRole === Role.ADMIN 
                ? "border-primary bg-primary/5 text-primary" 
                : "border-slate-100 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800"
            )}
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="text-sm font-bold">Admin</span>
          </button>
          <button
            onClick={() => setSelectedRole(Role.MEMBER)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
              selectedRole === Role.MEMBER 
                ? "border-primary bg-primary/5 text-primary" 
                : "border-slate-100 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800"
            )}
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-sm font-bold">Member</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder={selectedRole === Role.ADMIN ? "name@workspace.in" : "name@email.in"} 
                required 
                className="h-11" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <ForgotPasswordDialog />
              </div>
              <Input id="password" name="password" type="password" required className="h-11" />
            </div>
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Authenticating..." : `Login as ${selectedRole === Role.ADMIN ? "Admin" : "Member"}`}
            </Button>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
