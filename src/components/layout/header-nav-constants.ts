import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  TrendingUp,
  BarChart3,
  BookOpen,
  ClipboardList,
  Activity,
  Bot,
  Zap,
  Cpu,
  Sparkles,
} from "lucide-react";
import { isAiEnabled } from "@/lib/ai-features";

export const lastCommitMessage = process.env.NEXT_PUBLIC_LAST_COMMIT_MESSAGE || "";

export const AI_ONLY_ROUTES = new Set(["/insights", "/chat"]);

const todosItensPrincipais = [
  { href: "/", label: "Dashboard", icone: LayoutDashboard },
  { href: "/reports", label: "Relatorios", icone: FileText },
  { href: "/insights", label: "Análises", icone: Lightbulb },
  { href: "/desempenho", label: "Desempenho", icone: BarChart3 },
  { href: "/chat", label: "Fortuna", icone: Bot },
];

const todosItensSecundarios = [
  { href: "/trends", label: "Tendencias", icone: TrendingUp },
  { href: "/plano-acao", label: "Plano de Ação", icone: ClipboardList },
  { href: "/aprender", label: "Aprender", icone: BookOpen },
  ...(process.env.NODE_ENV === "development"
    ? [{ href: "/admin/proxy", label: "Proxy", icone: Activity }]
    : []),
];

const aiEnabled = isAiEnabled();

export const itensNavegacaoPrincipais = aiEnabled
  ? todosItensPrincipais
  : todosItensPrincipais.filter((item) => !AI_ONLY_ROUTES.has(item.href));

export const itensNavegacaoSecundarios = aiEnabled
  ? todosItensSecundarios
  : todosItensSecundarios.filter((item) => !AI_ONLY_ROUTES.has(item.href));

export const todosItensNavegacao = [...itensNavegacaoPrincipais, ...itensNavegacaoSecundarios];

export const TIER_ICONS = {
  haiku: Zap,
  sonnet: Cpu,
  opus: Sparkles,
} as const;

export const TIER_LABELS = {
  haiku: "Haiku",
  sonnet: "Sonnet",
  opus: "Opus",
} as const;
