"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/auth";
import { LogOut, User as UserIcon, Settings, CreditCard } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200 dark:border-zinc-800 p-0 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95">
          <Avatar className="h-9 w-9">
            <AvatarImage src={undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {(user.name || "User").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md bg-white/95 dark:bg-zinc-900/95" align="right" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {user.role}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
            <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
            <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer focus:bg-slate-50 dark:focus:bg-zinc-800">
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
        <DropdownMenuItem 
          className="rounded-lg py-2 m-1 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer" 
          onClick={async () => {
            await logout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
