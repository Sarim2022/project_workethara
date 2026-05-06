"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  const rawData = {
    title: formData.get("title")?.toString() || "",
    description: formData.get("description")?.toString() || null,
    projectId: formData.get("projectId")?.toString() || "",
    assigneeId: formData.get("assigneeId")?.toString(),
    status: formData.get("status")?.toString() || "PENDING",
    priority: formData.get("priority")?.toString() || "MEDIUM",
    dueDate: formData.get("dueDate")?.toString() || null,
  };

  if (rawData.assigneeId === "unassigned") {
    rawData.assigneeId = undefined;
  }

  const validated = taskSchema.safeParse(rawData);
  if (!validated.success) {
    const errorMsg = validated.error.issues[0]?.message || "Invalid input";
    throw new Error(errorMsg);
  }

  // Security: Verify project ownership before creating task
  const project = await prisma.project.findFirst({
    where: { id: validated.data.projectId, createdById: user.id }
  });
  if (!project) throw new Error("Unauthorized: You do not own this project.");

  if (validated.data.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: validated.data.assigneeId }
    });
    if (!assignee) throw new Error("Selected team member does not exist.");
  }

  await prisma.task.create({
    data: {
      title: validated.data.title,
      description: validated.data.description,
      status: (validated.data.status as TaskStatus) || TaskStatus.PENDING,
      priority: (validated.data.priority as TaskPriority) || TaskPriority.MEDIUM,
      projectId: validated.data.projectId,
      assigneeId: validated.data.assigneeId || null,
      dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
    },
  });

  revalidatePath("/dashboard");
}

export async function updateTaskPhase(taskId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { project: true }
  });
  if (!task) throw new Error("Task not found");

  // Only Admin (Owner) or Assignee can update
  if (user.role !== Role.ADMIN && task.assigneeId !== user.id) {
    if (task.project.createdById !== user.id) {
      throw new Error("Unauthorized");
    }
  }

  const phases: TaskStatus[] = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.TESTING, TaskStatus.DONE];
  const currentIndex = phases.indexOf(task.status);
  const nextIndex = (currentIndex + 1) % phases.length;
  const newStatus = phases[nextIndex];

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    }),
    prisma.statusLog.create({
      data: {
        taskId,
        userId: user.id,
        oldStatus: task.status,
        newStatus: newStatus
      }
    })
  ]);

  revalidatePath("/dashboard");
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { project: true }
  });
  if (!task) throw new Error("Task not found");

  if (user.role !== Role.ADMIN && task.assigneeId !== user.id) {
    if (task.project.createdById !== user.id) {
      throw new Error("Unauthorized");
    }
  }

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { status },
    }),
    prisma.statusLog.create({
      data: {
        taskId,
        userId: user.id,
        oldStatus: task.status,
        newStatus: status
      }
    })
  ]);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActivityFeed() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Data Isolation: Only see activity for projects you are involved in
  const where = user.role === Role.ADMIN 
    ? { task: { project: { createdById: user.id } } }
    : { task: { project: { members: { some: { id: user.id } } } } };

  return await prisma.statusLog.findMany({
    where,
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, role: true } },
      task: { select: { title: true } }
    }
  });
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  const name = formData.get("name")?.toString() || "";
  const description = formData.get("description")?.toString() || null;
  const clientDetails = formData.get("clientDetails")?.toString() || null;
  const deadlineStr = formData.get("deadline")?.toString() || null;

  if (!name) throw new Error("Project name is required");

  await prisma.project.create({
    data: {
      name,
      description,
      clientDetails,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      createdById: user.id,
      members: { connect: { id: user.id } }
    },
  });

  revalidatePath("/dashboard");
}

export async function addMemberToProject(projectId: string, userEmail: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  // Security: Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, createdById: user.id }
  });
  if (!project) throw new Error("Unauthorized: You do not own this project.");

  const memberToAdd = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!memberToAdd) throw new Error("User not found");

  await prisma.project.update({
    where: { id: projectId },
    data: { members: { connect: { id: memberToAdd.id } } }
  });

  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  // Security: Verify task ownership via project
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { createdById: user.id } }
  });
  if (!task) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProjects() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Data Isolation: Admins only see projects THEY created. Members see projects they are IN.
  const where = user.role === Role.ADMIN 
    ? { createdById: user.id } 
    : { members: { some: { id: user.id } } };

  return await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { members: true }
  });
}

export async function getTasks() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Data Isolation: Admins see tasks in their projects. Members see tasks assigned to them or in their projects.
  const where = user.role === Role.ADMIN 
    ? { project: { createdById: user.id } }
    : {
        OR: [
          { assigneeId: user.id },
          { project: { members: { some: { id: user.id } } } }
        ]
      };

  return await prisma.task.findMany({
    where,
    include: { 
      project: { include: { createdBy: true } }, 
      assignee: true 
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAllMembers() {
  return await prisma.user.findMany({
    where: { role: Role.MEMBER },
    select: { id: true, name: true, email: true }
  });
}

export async function getStats() {
  const user = await getCurrentUser();
  if (!user) return { projectCount: 0, taskCount: 0, completedCount: 0, completionRate: 0 };

  const projectWhere = user.role === Role.ADMIN 
    ? { createdById: user.id } 
    : { members: { some: { id: user.id } } };
  
  const taskWhere = user.role === Role.ADMIN 
    ? { project: { createdById: user.id } }
    : { assigneeId: user.id };

  const [projectCount, taskCount, completedCount] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: TaskStatus.DONE } }),
  ]);

  const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return { projectCount, taskCount, completedCount, completionRate };
}

export async function updateProject(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  // Security: Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, createdById: user.id }
  });
  if (!project) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const clientDetails = formData.get("clientDetails") as string;

  await prisma.project.update({
    where: { id },
    data: { name, clientDetails }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  // Security: Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, createdById: user.id }
  });
  if (!project) throw new Error("Unauthorized");

  await prisma.project.delete({
    where: { id }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function searchUserByEmail(email: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) throw new Error("Unauthorized");

  const targetUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, role: true }
  });

  return {
    exists: !!targetUser,
    name: targetUser?.name,
    role: targetUser?.role
  };
}
