import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <FileQuestion className="text-muted-foreground h-12 w-12" />
          <h2 className="text-lg font-semibold">Pagina nao encontrada</h2>
          <p className="text-muted-foreground text-sm">
            A pagina que voce procura nao existe ou foi removida.
          </p>
          <Link href="/">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
