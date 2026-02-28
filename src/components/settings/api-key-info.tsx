"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { icon, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function ApiKeyInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className={cn(icon.cardTitle, "text-primary")} />
          Features Using Gemini API
        </CardTitle>
        <CardDescription>
          These features require a valid Gemini API key to work properly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>PDF Report Extraction</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Automatically extracts investment data from your PDF reports using AI analysis
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>Insights Generation</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Generates monthly investment insights and performance analysis based on your portfolio
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>Asset Analysis</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Provides detailed analysis of your investments and market trends
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
