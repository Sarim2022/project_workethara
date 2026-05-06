"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200 dark:border-zinc-800 p-0 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95">
          <Avatar className="h-9 w-9">
            <AvatarImage src={undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {(user.name || "User").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-black">Wanna logout from workethara</DialogTitle>
          <DialogDescription className="text-xs">
            Logged in as {user.name || user.email.split("@")[0]} ({user.role})
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <form action={logout}>
            <Button type="submit" variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
