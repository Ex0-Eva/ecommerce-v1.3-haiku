"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { CartSync } from "@/components/CartSync";

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider
      session={session ?? undefined}
      basePath="/api/auth"
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      <CartSync />
      {children}
    </SessionProvider>
  );
}
