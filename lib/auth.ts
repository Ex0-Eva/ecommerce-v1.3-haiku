import bcrypt from "bcryptjs";
import { db } from "./db";

export type UserRole = "user" | "admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    passwordHash: user.passwordHash,
    role: (user.role as UserRole) ?? "user",
  };
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function registerUser({
  id,
  name,
  email,
  password,
  role,
}: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<AppUser> {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { id, name, email, passwordHash, role },
  });

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    passwordHash: user.passwordHash!,
    role: user.role as UserRole,
  };
}
