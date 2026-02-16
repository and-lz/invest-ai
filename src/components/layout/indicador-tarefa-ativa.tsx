"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dispararEventoNotificacaoCriada } from "@/hooks/use-notificacoes";
import { useTarefaBackground } from "@/hooks/use-tarefa-background";
import { descreverTarefa } from "@/lib/tarefa-background";

const CHAVE_LOCAL_STORAGE = "tarefasAtivas";
const TIMEOUT_MINUTOS = 5;

function obterTarefasAtivasDoStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL_STORAGE) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function salvarTarefasAtivasNoStorage(identificadores: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(identificadores));
}

export function adicionarTarefaAtivaNoStorage(identificadorTarefa: string): void {
  const atuais = obterTarefasAtivasDoStorage();
  if (!atuais.includes(identificadorTarefa)) {
    atuais.push(identificadorTarefa);
    salvarTarefasAtivasNoStorage(atuais);
  }
  // Dispara evento para que o componente reaja imediatamente
  window.dispatchEvent(new CustomEvent("tarefa-ativa-adicionada"));
}

function removerTarefaAtivaDoStorage(identificadorTarefa: string): void {
  const atuais = obterTarefasAtivasDoStorage();
  const filtradas = atuais.filter((id) => id !== identificadorTarefa);
  salvarTarefasAtivasNoStorage(filtradas);
}

// Componente interno que monitora uma única tarefa
function MonitorTarefa({
  identificadorTarefa,
  onConcluida,
}: {
  identificadorTarefa: string;
  onConcluida: (identificador: string) => void;
}) {
  const router = useTransitionRouter();
  const { tarefa, estaConcluido, estaComErro, estaProcessando } =
    useTarefaBackground(identificadorTarefa);
  const [jaNotificou, setJaNotificou] = useState(false);

  useEffect(() => {
    if (jaNotificou) return;

    if (estaConcluido && tarefa) {
      setJaNotificou(true);
      // Toast apenas (notificacao server-side ja foi criada pelo executor)
      toast.success("Tarefa concluida!", {
        description: tarefa.descricaoResultado,
        action: tarefa.urlRedirecionamento
          ? {
              label: "Ver resultado",
              onClick: () => router.push(tarefa.urlRedirecionamento!),
            }
          : undefined,
      });
      dispararEventoNotificacaoCriada();
      window.dispatchEvent(new CustomEvent("tarefa-background-concluida"));
      onConcluida(identificadorTarefa);
    }

    if (estaComErro && tarefa) {
      setJaNotificou(true);
      // Toast apenas (notificacao server-side ja foi criada pelo executor)
      toast.error("Erro no processamento", {
        description: tarefa.erro ?? "Erro desconhecido",
      });
      dispararEventoNotificacaoCriada();
      window.dispatchEvent(new CustomEvent("tarefa-background-concluida"));
      onConcluida(identificadorTarefa);
    }

    // Timeout: se "processando" por mais de 5 minutos, considerar como erro
    if (estaProcessando && tarefa) {
      const iniciadoHaMinutos = (Date.now() - new Date(tarefa.iniciadoEm).getTime()) / 60000;
      if (iniciadoHaMinutos > TIMEOUT_MINUTOS) {
        setJaNotificou(true);
        toast.error("Tarefa parece ter falhado", {
          description: "O processamento excedeu o tempo limite. Tente novamente.",
        });
        onConcluida(identificadorTarefa);
      }
    }
  }, [
    estaConcluido,
    estaComErro,
    estaProcessando,
    tarefa,
    jaNotificou,
    identificadorTarefa,
    onConcluida,
    router,
  ]);

  if (!estaProcessando || !tarefa) return null;

  const descricao = descreverTarefa(tarefa);

  return <span className="text-muted-foreground text-xs">{descricao}...</span>;
}

export function IndicadorTarefaAtiva() {
  const [identificadoresTarefas, setIdentificadoresTarefas] = useState<string[]>([]);

  // Carregar do localStorage ao montar
  useEffect(() => {
    setIdentificadoresTarefas(obterTarefasAtivasDoStorage());

    // Reagir quando uma nova tarefa é adicionada
    const handleNovaTarefa = () => {
      setIdentificadoresTarefas(obterTarefasAtivasDoStorage());
    };

    window.addEventListener("tarefa-ativa-adicionada", handleNovaTarefa);
    return () => window.removeEventListener("tarefa-ativa-adicionada", handleNovaTarefa);
  }, []);

  const handleTarefaConcluida = useCallback((identificador: string) => {
    removerTarefaAtivaDoStorage(identificador);
    setIdentificadoresTarefas((anteriores) => anteriores.filter((id) => id !== identificador));
  }, []);

  if (identificadoresTarefas.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
      <div className="flex flex-col">
        {identificadoresTarefas.map((identificador) => (
          <MonitorTarefa
            key={identificador}
            identificadorTarefa={identificador}
            onConcluida={handleTarefaConcluida}
          />
        ))}
      </div>
    </div>
  );
}
