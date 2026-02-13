import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.userId) {
    return {
      authenticated: false as const,
      response: NextResponse.json({ erro: "Nao autenticado" }, { status: 401 }),
    };
  }

  return {
    authenticated: true as const,
    session,
  };
}
