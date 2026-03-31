"use client";

import useSWR from "swr";
import { Activity, Clock, Hash, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { layout, icon, typography } from "@/lib/design-system";

interface RequestLogEntry {
  timestamp: string;
  method: string;
  url: string;
  model: string | null;
  statusCode: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

interface ProxyStats {
  reachable: boolean;
  error?: string;
  status?: string;
  startedAt?: string;
  uptimeMs?: number;
  totalRequests?: number;
  bufferSize?: number;
  requests?: RequestLogEntry[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatModel(model: string | null): string {
  if (!model) return "—";
  return model
    .replace("claude-", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProxyMonitorPage() {
  const { data, isLoading } = useSWR<ProxyStats>(
    "/api/admin/proxy-stats",
    fetcher,
    { refreshInterval: 5000 }
  );

  const reachable = data?.reachable ?? false;
  const requests = data?.requests ?? [];

  return (
    <div className={layout.pageSpacing}>
      <div className={layout.pageHeader}>
        <Activity className={cn(icon.pageTitle, "text-muted-foreground")} />
        <Header titulo="Proxy Monitor" descricao="Claude proxy health and request history" />
      </div>

      {isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-3.5 w-12" /></TableHead>
                    <TableHead><Skeleton className="h-3.5 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-3.5 w-14" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="ml-auto h-3.5 w-16" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="ml-auto h-3.5 w-20" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="ml-auto h-3.5 w-20" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-14" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!isLoading && !reachable && (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 p-6">
            <WifiOff className={cn(icon.cardTitle, "text-destructive")} />
            <div>
              <p className={typography.label}>Proxy unreachable</p>
              <p className={cn(typography.helper, "mt-1")}>
                {data?.error ?? "Start the proxy with `npm run proxy`"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && reachable && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={typography.label}>Status</CardTitle>
                <Wifi className={cn(icon.button, "text-success")} />
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="border-success/30 text-success">
                  Online
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={typography.label}>Uptime</CardTitle>
                <Clock className={cn(icon.button, "text-muted-foreground")} />
              </CardHeader>
              <CardContent>
                <p className={typography.mainValue}>
                  {data?.uptimeMs ? formatUptime(data.uptimeMs) : "—"}
                </p>
                {data?.startedAt && (
                  <p className={typography.helper}>
                    Since {new Date(data.startedAt).toLocaleString("pt-BR")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={typography.label}>Total Requests</CardTitle>
                <Hash className={cn(icon.button, "text-muted-foreground")} />
              </CardHeader>
              <CardContent>
                <p className={typography.mainValue}>
                  {data?.totalRequests ?? 0}
                </p>
                <p className={typography.helper}>
                  {data?.bufferSize ?? 0} in buffer (max 200)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className={typography.h3}>Request History</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className={layout.emptyStateCard}>
                  <Activity className={icon.emptyState} />
                  <p className="text-muted-foreground">No requests recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Latency</TableHead>
                        <TableHead className="text-right">In tokens</TableHead>
                        <TableHead className="text-right">Out tokens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req, i) => (
                        <TableRow key={`${req.timestamp}-${i}`}>
                          <TableCell className={typography.mono}>
                            {formatTimestamp(req.timestamp)}
                          </TableCell>
                          <TableCell>{formatModel(req.model)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                req.statusCode === 200
                                  ? "border-success/30 text-success"
                                  : "border-destructive/30 text-destructive"
                              )}
                            >
                              {req.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(typography.mono, "text-right")}>
                            {req.latencyMs.toLocaleString()}ms
                          </TableCell>
                          <TableCell className={cn(typography.mono, "text-right")}>
                            {req.inputTokens.toLocaleString()}
                          </TableCell>
                          <TableCell className={cn(typography.mono, "text-right")}>
                            {req.outputTokens.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
