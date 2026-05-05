import Link from "next/link";
import { UserNav } from "./user-nav";
import { getCurrentUser } from "@/lib/auth";
import { Briefcase, LayoutDashboard, LogOut, Mail } from "lucide-react";
import { Role } from "@prisma/client";
import { UserSearch } from "./user-search";
import { Button } from "./ui/button";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-zinc-800/50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Workethara</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:text-primary transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/50 group hover:border-primary/30 transition-colors">
              <Mail className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{user.email}</span>
            </div>
          )}
          {user?.role === Role.ADMIN && (
            <UserSearch />
          )}
          {user && (
            <>
              <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
              <UserNav user={user} />
              <form action={logout}>
                <Button type="submit" variant="ghost" size="icon" className="text-slate-500 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
