import { Role, type User } from "@prisma/client";
export type { User };
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me_in_prod");

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(SECRET);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, SECRET, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;

    const parsed = await decrypt(session);
    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
    });
    return user;
  } catch (err) {
    return null;
  }
}

export function getRoleFromEmail(email: string): Role {
  if (email.endsWith("@workspace.in")) return Role.ADMIN;
  if (email.endsWith("@email.in")) return Role.MEMBER;
  return Role.MEMBER;
}
