import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next E-commerce",
  description: "Next.js 16.2.6 App Router ecommerce architecture",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ดึง session จาก server ส่งลง SessionProvider
  // หาก JWT cookie เสียหายหรือ secret เปลี่ยนระหว่างรัน ให้ fallback เป็น undefined
  let session;
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
      [
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.csrf-token",
        "__Secure-next-auth.csrf-token",
        "next-auth.callback-url",
      ].forEach((name) => cookieStore.delete(name));
    }
  }

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
