import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { typography, icon, layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function SettingsLoading() {
  return (
    <div className={cn(layout.pageSpacing, "max-w-2xl mx-auto py-6")}>
      <div className={cn(layout.pageHeader, "mb-6")}>
        <Settings className={cn(icon.pageTitle, "text-primary")} />
        <h1 className={typography.h1}>Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
