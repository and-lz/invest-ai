import { Separator } from "@/components/ui/separator";
import { tipografia } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface HeaderProps {
  titulo: string;
  descricao?: string;
}

export function Header({ titulo, descricao }: HeaderProps) {
  return (
    <div className="space-y-1 pb-4">
      <h2 className={cn(tipografia.h2, "sm:text-2xl")}>{titulo}</h2>
      {descricao && <p className="text-muted-foreground">{descricao}</p>}
      <Separator className="mt-4" />
    </div>
  );
}
