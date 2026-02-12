import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  titulo: string;
  descricao?: string;
}

export function Header({ titulo, descricao }: HeaderProps) {
  return (
    <div className="space-y-1 pb-4">
      <h2 className="text-2xl font-bold tracking-tight">{titulo}</h2>
      {descricao && <p className="text-muted-foreground">{descricao}</p>}
      <Separator className="mt-4" />
    </div>
  );
}
