import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("NextAuth getServerSession failed:", error);
    const isJWTError =
      typeof error === "object" &&
      error !== null &&
      ("name" in error ? (error as any).name === "JWEDecryptionFailed" : false);
    if (isJWTError) {
      const cookieStore = await cookies();
      ["next-auth.session-token", "__Secure-next-auth.session-token",
       "next-auth.csrf-token", "__Secure-next-auth.csrf-token",
       "next-auth.callback-url"].forEach((name) => cookieStore.delete(name));
    }
  }

  if (!session) redirect("/login");
  if ((session.user as any)?.role !== "admin") redirect("/");

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
