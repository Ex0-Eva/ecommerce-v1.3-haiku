import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await findUserByEmail(credentials.email);
          if (!user) return null;

          const validPassword = await verifyPassword(credentials.password, user.passwordHash);
          if (!validPassword) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
  debug: false,
};
