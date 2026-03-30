import { revalidarTarefasAtivas } from "@/hooks/use-active-tasks";
import type { TarefaBackground } from "@/lib/task-description";
import type { Conclusao } from "./takeaway-box-types";
import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from "./takeaway-box-types";

/**
 * Creates an explain-takeaway background task and polls until completion.
 * Returns the explanations map from the task's descricaoResultado.
 */
export async function fetchExplanations(
  conclusions: Conclusao[],
): Promise<Record<string, string>> {
  // 1. Create background task
  const createResponse = await fetch("/api/explain-takeaway", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conclusions: conclusions.map((c) => ({
        text: c.texto,
        type: c.tipo,
      })),
    }),
  });

  if (!createResponse.ok) {
    const errorBody = (await createResponse.json().catch(() => ({}))) as {
      erro?: string;
    };
    throw new Error(errorBody.erro ?? "Falha ao iniciar explicacoes");
  }

  const { identificadorTarefa } = (await createResponse.json()) as {
    identificadorTarefa: string;
  };

  // Notify activity center about new task
  revalidarTarefasAtivas();

  // 2. Poll task status until completion
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusResponse = await fetch(`/api/tasks/${identificadorTarefa}`);
    if (!statusResponse.ok) continue;

    const tarefa = (await statusResponse.json()) as TarefaBackground;

    if (tarefa.status === "concluido" && tarefa.descricaoResultado) {
      const parsed: unknown = JSON.parse(tarefa.descricaoResultado);
      if (parsed && typeof parsed === "object" && "error" in parsed) {
        throw new Error("Fortuna retornou formato inesperado");
      }
      return parsed as Record<string, string>;
    }

    if (tarefa.status === "erro") {
      throw new Error(tarefa.erro ?? "Erro ao gerar explicacoes");
    }

    if (tarefa.status === "cancelada") {
      throw new Error("Tarefa cancelada");
    }
  }

  throw new Error("Tempo limite excedido ao gerar explicacoes");
}
