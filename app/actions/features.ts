"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSprint(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;
  const duration = parseInt(formData.get("duration") as string);

  if (!name || !projectId || isNaN(duration)) throw new Error("Missing sprint details");

  // Extract weekly tasks from formData
  // Keys will be like: "week-1-task-0", "week-1-task-1", etc.
  const taskData: { title: string, week: number }[] = [];
  
  formData.forEach((value, key) => {
    if (key.startsWith("week-") && key.includes("-task-")) {
      const parts = key.split("-");
      const week = parseInt(parts[1]);
      taskData.push({ title: value as string, week });
    }
  });

  await prisma.sprint.create({
    data: {
      name,
      projectId,
      duration,
      createdById: user.id,
      tasks: {
        create: taskData
      }
    }
  });

  revalidatePath("/dashboard");
}

export async function updateProjectRepo(projectId: string, repoLink: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.project.update({
    where: { id: projectId },
    data: { repoLink }
  });

  revalidatePath("/dashboard");
}

export async function createMeetingRoom(name: string, userCount: number, link?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.meetingRoom.create({
    data: {
      name,
      userCount,
      link,
      createdById: user.id
    }
  });

  revalidatePath("/dashboard");
}

export async function createPersonalTodo(title: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.personalTodo.create({
    data: {
      title,
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
}

export async function deletePersonalTodo(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.personalTodo.delete({
    where: { id, userId: user.id }
  });

  revalidatePath("/dashboard");
}

export async function getPersonalTodos() {
  const user = await getCurrentUser();
  if (!user) return [];

  return await prisma.personalTodo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
}
