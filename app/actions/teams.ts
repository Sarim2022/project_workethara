"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export async function createTeam(teamName: string, memberEmails: string[]) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  const normalizedName = teamName.trim();
  if (!normalizedName) throw new Error("Team name is required");

  const normalizedEmails = Array.from(
    new Set(memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))
  );

  if (normalizedEmails.length === 0) {
    throw new Error("Add at least one valid member email");
  }

  const users = await prisma.user.findMany({
    where: {
      email: { in: normalizedEmails },
      role: Role.MEMBER
    },
    select: { id: true, email: true }
  });

  if (users.length !== normalizedEmails.length) {
    throw new Error("One or more member emails are invalid or not members");
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
    throw new Error(`${conflict.userEmail} is already in team "${conflict.team.teamName}"`);
  }

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

  revalidatePath("/dashboard");
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
