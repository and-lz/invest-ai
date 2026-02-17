import useSWR from "swr";
import { useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TarefaBackground } from "@/lib/tarefa-descricao";
import { descreverTarefa } from "@/lib/tarefa-descricao";

const EVENTO_TAREFAS_REVALIDAR = "tarefas-ativas-revalidar";
const POLLING_INTERVAL_MS = 3000;

interface TarefasAtivasApiResponse {
  tarefas: TarefaBackground[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) return { tarefas: [] };
    return res.json() as Promise<TarefasAtivasApiResponse>;
  });

/**
 * Detects task IDs that were previously active but are no longer in the current list.
 * Pure function extracted for testability.
 */
export function detectCompletedTaskIds(
  previousIds: Set<string>,
  currentIds: Set<string>,
  alreadyNotifiedIds: Set<string>,
): string[] {
  const completed: string[] = [];
  for (const id of previousIds) {
    if (!currentIds.has(id) && !alreadyNotifiedIds.has(id)) {
      completed.push(id);
    }
  }
  return completed;
}

/**
 * SWR hook that polls GET /api/tasks for active ("processando") tasks.
 * Detects task completion by diffing current vs previous task IDs.
 * Shows toast notifications when tasks complete or fail.
 */
export function useTarefasAtivas() {
  const router = useRouter();
  const previousIdsRef = useRef<Set<string>>(new Set());
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const { data, error, isLoading, mutate } = useSWR<TarefasAtivasApiResponse>(
    "/api/tasks",
    fetcher,
    {
      refreshInterval: POLLING_INTERVAL_MS,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const tarefasAtivas = useMemo(() => data?.tarefas ?? [], [data?.tarefas]);

  // Listen for manual revalidation triggers (from callers after creating tasks)
  useEffect(() => {
    const handleRevalidar = () => {
      void mutate();
    };
    window.addEventListener(EVENTO_TAREFAS_REVALIDAR, handleRevalidar);
    return () => window.removeEventListener(EVENTO_TAREFAS_REVALIDAR, handleRevalidar);
  }, [mutate]);

  // Completion detection: diff current IDs vs previous IDs
  useEffect(() => {
    if (!data) return;

    const currentIds = new Set(tarefasAtivas.map((t) => t.identificador));

    // Skip diff on first successful fetch — just seed the set
    if (!initializedRef.current) {
      initializedRef.current = true;
      previousIdsRef.current = currentIds;
      return;
    }

    const completedIds = detectCompletedTaskIds(
      previousIdsRef.current,
      currentIds,
      notifiedIdsRef.current,
    );

    for (const taskId of completedIds) {
      notifiedIdsRef.current.add(taskId);
      void fetchAndNotifyCompletion(taskId, router);
    }

    previousIdsRef.current = currentIds;
  }, [tarefasAtivas, data, router]);

  const revalidar = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    tarefasAtivas,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    revalidar,
  };
}

/**
 * Fetches the final status of a completed task and shows a toast.
 * Also dispatches "tarefa-background-concluida" for other hooks to revalidate.
 */
async function fetchAndNotifyCompletion(
  taskId: string,
  router: ReturnType<typeof useRouter>,
): Promise<void> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`);
    if (!response.ok) return;

    const tarefa = (await response.json()) as TarefaBackground;
    const descricao = descreverTarefa(tarefa);

    if (tarefa.status === "concluido") {
      toast.success(`${descricao} — concluída!`, {
        description: tarefa.descricaoResultado,
        action: tarefa.urlRedirecionamento
          ? {
              label: "Ver resultado",
              onClick: () => router.push(tarefa.urlRedirecionamento!),
            }
          : undefined,
      });
    } else if (tarefa.status === "erro") {
      toast.error(`${descricao} — erro`, {
        description: tarefa.erro ?? "Erro desconhecido",
      });
    }
    // "cancelada" — no toast needed (user already triggered it)

    window.dispatchEvent(new CustomEvent("tarefa-background-concluida"));
  } catch {
    // Silent fail — notification center has the server-side notification anyway
  }
}

/**
 * Triggers immediate revalidation of the active tasks list.
 * Call this after creating a new task to make it appear instantly
 * instead of waiting for the next poll cycle.
 */
export function revalidarTarefasAtivas(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENTO_TAREFAS_REVALIDAR));
  }
}
