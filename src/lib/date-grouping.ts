/**
 * Groups items by relative date: Hoje, Ontem, Últimos 7 dias, Mais antigas.
 */

interface DateGroupable {
  atualizadaEm: string;
}

interface DateGroup<T> {
  label: string;
  items: T[];
}

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function groupByDate<T extends DateGroupable>(items: readonly T[]): DateGroup<T>[] {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 6 * 86_400_000;

  const groups: Record<string, T[]> = {
    Hoje: [],
    Ontem: [],
    "Últimos 7 dias": [],
    "Mais antigas": [],
  };

  for (const item of items) {
    const ts = new Date(item.atualizadaEm).getTime();
    if (ts >= todayStart) {
      groups["Hoje"]!.push(item);
    } else if (ts >= yesterdayStart) {
      groups["Ontem"]!.push(item);
    } else if (ts >= weekStart) {
      groups["Últimos 7 dias"]!.push(item);
    } else {
      groups["Mais antigas"]!.push(item);
    }
  }

  const order = ["Hoje", "Ontem", "Últimos 7 dias", "Mais antigas"] as const;
  return order
    .filter((label) => groups[label]!.length > 0)
    .map((label) => ({ label, items: groups[label]! }));
}
