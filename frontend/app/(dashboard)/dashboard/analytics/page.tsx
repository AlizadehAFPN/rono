"use client";

import { Topbar } from "@/components/dashboard/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyticsOverview, useItemStats } from "@/lib/hooks/use-analytics";
import { useI18n } from "@/lib/i18n/context";

export default function AnalyticsPage() {
  const { t } = useI18n();
  const a = t.dashAnalytics;
  const { data: overview, isLoading } = useAnalyticsOverview();
  const { data: items } = useItemStats(50);

  const calibLabel = (k: string) =>
    a.calibration[k as keyof typeof a.calibration] ?? k;
  const pct = (v: number | null) =>
    v != null ? `${Math.round(v * 100)}%` : "—";

  return (
    <div className="flex flex-col">
      <Topbar title={a.pageTitle} />
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">{a.loading}</p>
        )}

        {overview && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label={a.overview.items} value={overview.total_items} />
            <Stat label={a.overview.activeItems} value={overview.active_items} />
            <Stat label={a.overview.responses} value={overview.total_responses} />
            <Stat label={a.overview.accuracy} value={pct(overview.overall_accuracy)} />
            <Stat label={a.overview.users} value={overview.total_users} />
            <Stat label={a.overview.sessions} value={overview.completed_sessions} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{a.items.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{a.items.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{a.items.preview}</TableHead>
                    <TableHead className="text-right">{a.items.responses}</TableHead>
                    <TableHead className="text-right">{a.items.accuracy}</TableHead>
                    <TableHead className="text-right">{a.items.difficulty}</TableHead>
                    <TableHead>{a.items.calibration}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items && items.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {a.items.empty}
                      </TableCell>
                    </TableRow>
                  )}
                  {items?.items.map((it) => (
                    <TableRow key={it.item_id}>
                      <TableCell className="max-w-sm">
                        <span className="line-clamp-1 text-sm">{it.preview}</span>
                        {it.exam_type && (
                          <span className="text-xs text-muted-foreground">
                            {it.exam_type}
                            {it.exam_part ? ` · ${it.exam_part}` : ""}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.response_count}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {pct(it.accuracy)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {it.irt_b != null ? it.irt_b.toFixed(1) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {calibLabel(it.calibration_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
