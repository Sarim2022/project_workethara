"use server";

import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSprint(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;
  const duration = parseInt(formData.get("duration") as string);
  const crIdString = formData.get("crId") as string;
  const crId = crIdString ? parseInt(crIdString) : null;

  if (!name || !projectId || isNaN(duration)) throw new Error("Missing sprint details");

  // Extract weekly tasks from formData
  // Keys will be like: "week-1-task-0", "week-1-task-1-assignee", etc.
  const taskMap: Map<string, { title: string, week: number, assigneeId?: string }> = new Map();

  formData.forEach((value, key) => {
    if (key.startsWith("week-") && key.includes("-task-")) {
      const parts = key.split("-");
      const week = parseInt(parts[1]);
      const taskIndex = parts[3];
      const mapKey = `${week}-${taskIndex}`;

      const current = taskMap.get(mapKey) || { title: "", week };

      if (key.endsWith("-assignee")) {
        current.assigneeId = value as string;
      } else {
        current.title = value as string;
      }

      taskMap.set(mapKey, current);
    }
  });

  const taskData = Array.from(taskMap.values()).filter(t => t.title.trim() !== "");

  await prisma.sprint.create({
    data: {
      name,
      projectId,
      duration,
      crId,
      createdById: user.id,
      tasks: {
        create: taskData.map(t => ({
          title: t.title,
          week: t.week,
          assigneeId: t.assigneeId || null
        }))
      }
    }
  });

  revalidatePath("/dashboard");
}

export async function updateProjectRepo(projectId: string, repoLink: string, repoAdminId?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, createdById: user.id },
    include: { members: { select: { id: true, role: true } } }
  });
  if (!project) throw new Error("Unauthorized: You do not own this project.");

  const selectedRepoAdminId = repoAdminId && repoAdminId !== "unassigned" ? repoAdminId : null;
  if (selectedRepoAdminId) {
    const selectedMember = project.members.find((member) => member.id === selectedRepoAdminId);
    if (!selectedMember || selectedMember.role !== Role.MEMBER) {
      throw new Error("Assign Team Admin must be a member of the selected project.");
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      repoLink,
      repoAdminId: selectedRepoAdminId
    }
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

export async function getSprints() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return [];

  return await prisma.sprint.findMany({
    where: {
      createdById: user.id
    },
    include: {
      project: true,
      tasks: {
        include: {
          assignee: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getProjectSprints(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  return await prisma.sprint.findMany({
    where: { projectId },
    include: {
      tasks: {
        include: {
          assignee: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAssignedSprintTasks(userId: string) {
  return await prisma.sprintTask.findMany({
    where: { assigneeId: userId },
    include: {
      sprint: {
        include: {
          project: true
        }
      }
    },
    orderBy: { week: "asc" }
  });
}

export async function getAssignedSprints(userId: string) {
  return await prisma.sprint.findMany({
    where: {
      tasks: {
        some: {
          assigneeId: userId,
          status: { not: TaskStatus.DONE }
        }
      }
    },
    include: {
      project: true,
      tasks: {
        where: { assigneeId: userId },
        orderBy: { week: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getMemberRepositoryLinks(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) return [];

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true }
  });

  return await prisma.project.findMany({
    where: {
      repoLink: { not: null },
      OR: [
        { members: { some: { id: userId } } },
        { tasks: { some: { teamId: membership?.teamId ?? "__no_member_team__" } } },
        { tasks: { some: { assigneeId: userId } } },
        { sprints: { some: { tasks: { some: { assigneeId: userId } } } } }
      ]
    },
    select: {
      id: true,
      name: true,
      repoLink: true,
      repoAdminId: true
    },
    orderBy: { updatedAt: "desc" }
  });
}
export async function updateSprintTaskStatus(taskId: string, status: TaskStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.sprintTask.update({
    where: { id: taskId },
    data: { status }
  });
}

export async function updateSprintTaskPhase(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.sprintTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const phases: TaskStatus[] = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.TESTING, TaskStatus.DONE];
  const currentIndex = phases.indexOf(task.status);
  const nextIndex = (currentIndex + 1) % phases.length;
  const newStatus = phases[nextIndex];

  await prisma.sprintTask.update({
    where: { id: taskId },
    data: { status: newStatus }
  });

  revalidatePath("/dashboard");
}

export async function updateSprintTaskPhaseBackward(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.sprintTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const phases: TaskStatus[] = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.TESTING, TaskStatus.DONE];
  const currentIndex = phases.indexOf(task.status);
  const previousIndex = (currentIndex - 1 + phases.length) % phases.length;
  const newStatus = phases[previousIndex];

  await prisma.sprintTask.update({
    where: { id: taskId },
    data: { status: newStatus }
  });

  revalidatePath("/dashboard");
}
