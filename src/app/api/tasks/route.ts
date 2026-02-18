import { NextResponse } from "next/server";
import { listActiveTasksByUser } from "@/lib/background-task";
import { requireAuth } from "@/lib/auth-utils";
import { cabecalhosSemCache } from "@/lib/cache-headers";

export async function GET() {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const tarefas = await listActiveTasksByUser(
      authCheck.session.user.userId,
    );
    return NextResponse.json({ tarefas }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Error listing active tasks:", erro);
    return NextResponse.json(
      { erro: "Failed to list active tasks" },
      { status: 500 },
    );
  }
}
