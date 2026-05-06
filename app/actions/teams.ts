"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

type CreateTeamResult =
  | { success: true; error?: never }
  | { success: false; error: string };

export type AdminTeam = {
  id: string;
  teamName: string;
  members: {
    id: string;
    userEmail: string;
    userId: string;
    user: { id: string; email: string; name: string | null };
  }[];
};

export async function getAdminTeams() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) return [];

  return prisma.team.findMany({
    where: { adminId: user.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createTeam(teamName: string, memberEmails: string[]): Promise<CreateTeamResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized" };
  }

  const normalizedName = teamName.trim();
  if (!normalizedName) {
    return { success: false, error: "Team name is required" };
  }

  const normalizedEmails = Array.from(
    new Set(memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))
  );

  if (normalizedEmails.length === 0) {
    return { success: false, error: "Add at least one valid member email" };
  }

  const invalidEmails = normalizedEmails.filter((email) => !email.endsWith("@email.in"));
  if (invalidEmails.length > 0) {
    return {
      success: false,
      error: `Team members must use @email.in addresses: ${invalidEmails.join(", ")}`
    };
  }

  const users = await prisma.user.findMany({
    where: {
      email: { in: normalizedEmails },
      role: Role.MEMBER
    },
    select: { id: true, email: true }
  });

  if (users.length !== normalizedEmails.length) {
    const foundEmails = new Set(users.map((member) => member.email.toLowerCase()));
    const missingEmails = normalizedEmails.filter((email) => !foundEmails.has(email));
    return {
      success: false,
      error: `These member emails are not registered yet: ${missingEmails.join(", ")}`
    };
  }

  const existingMemberships = await prisma.teamMember.findMany({
    where: {
      userId: { in: users.map((u) => u.id) }
    },
    include: {
      team: {
        select: {
          id: true,
          teamName: true
        }
      }
    }
  });

  if (existingMemberships.length > 0) {
    const conflict = existingMemberships[0];
    return {
      success: false,
      error: `${conflict.userEmail} is already in team "${conflict.team.teamName}"`
    };
  }

  try {
    await prisma.team.create({
      data: {
        teamName: normalizedName,
        adminId: user.id,
        members: {
          create: users.map((member) => ({
            userEmail: member.email,
            userId: member.id
          }))
        }
      }
    });
  } catch (error) {
    console.error("Create team error:", error);
    return { success: false, error: "Failed to create team. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getCurrentUserTeam() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === Role.ADMIN) return null;

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: {
      team: {
        select: {
          id: true,
          teamName: true
        }
      }
    }
  });

  return membership?.team ?? null;
}
