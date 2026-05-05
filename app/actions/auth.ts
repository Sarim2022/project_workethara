"use server";

import { prisma } from "@/lib/prisma";
import { encrypt, getRoleFromEmail } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) throw new Error("Missing credentials");

  // Domain Validation Logic
  if (!email.endsWith("@workspace.in") && !email.endsWith("@email.in")) {
    throw new Error("Please use your official @workspace.in or @email.in address");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const role = getRoleFromEmail(email);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Create session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ userId: user.id, email: user.email, role: user.role, expires });

    (await cookies()).set("session", session, { expires, httpOnly: true });
  } catch (error) {
    throw new Error("User already exists or database error");
  }

  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) throw new Error("Missing credentials");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  // Create session
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ userId: user.id, email: user.email, role: user.role, expires });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/login");
}