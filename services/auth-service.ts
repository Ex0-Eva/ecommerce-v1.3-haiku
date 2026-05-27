export async function signIn(email: string, password: string) {
  return { success: false, message: "Auth service placeholder. Configure NextAuth or Clerk." };
}

export async function signOut() {
  return { success: true };
}
