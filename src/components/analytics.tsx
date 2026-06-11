"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
  AreaChart,
  Area,
} from "recharts";

import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "./ui/calendar";

import {
  Activity,
  List,
  Zap,
  ScrollText,
  BarChart3,
  Download,
  Lightbulb,
  TrendingUp,
  X,
  ChevronDownIcon,
  Users,
} from "lucide-react";

// ─── Color palette ────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "#00a896",
  "#378add",
  "#ef9f27",
  "#d85a30",
  "#8b5cf6",
  "#d4537e",
  "#0f6e56",
  "#185fa5",
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  label: string;
  count: number;
}

interface AnalyticsState {
  diagnoses: AnalyticsData[];
  prescriptions: AnalyticsData[];
  drugs: AnalyticsData[];
  ages: AnalyticsData[];
  genders: AnalyticsData[];
  infant: AnalyticsData[];
  teen: AnalyticsData[];
  adult: AnalyticsData[];
  middleage: AnalyticsData[];
  senior: AnalyticsData[];
  male: AnalyticsData[];
  female: AnalyticsData[];
  trendByDiagnosis: Record<string, AnalyticsData[]>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mapToArray = (map: Record<string, number>): AnalyticsData[] =>
  Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

const getDiagnosisCounts = (records: any[]): AnalyticsData[] => {
  const map: Record<string, number> = {};
  records.forEach((p) => {
    if (!Array.isArray(p?.diagnosis)) return;
    p.diagnosis.forEach((d: { diagnosis: string }) => {
      const name = d.diagnosis?.trim();
      if (name) map[name] = (map[name] || 0) + 1;
    });
  });
  return mapToArray(map);
};

const getDrugCounts = (records: any[]): AnalyticsData[] => {
  const map: Record<string, number> = {};
  records.forEach((p) => {
    if (!Array.isArray(p?.drugs)) return;
    p.drugs.forEach((d: { medicine: string }) => {
      const name = d.medicine?.trim();
      if (name) map[name] = (map[name] || 0) + 1;
    });
  });
  return mapToArray(map);
};

const getGenderCounts = (records: any[]): AnalyticsData[] => {
  const map: Record<string, number> = {};
  records.forEach((p) => {
    const g = p.gender?.trim();
    if (g) map[g] = (map[g] || 0) + 1;
  });
  return mapToArray(map);
};

const getAgeCounts = (records: any[]): AnalyticsData[] => {
  const map: Record<string, number> = {};
  records.forEach((p) => {
    const age = p.age?.toString().trim();
    if (age) map[age] = (map[age] || 0) + 1;
  });
  return mapToArray(map).slice(0, 5);
};

const getDiagnosisTrend = (
  records: any[],
  diagnosisName: string,
): AnalyticsData[] => {
  const map: Record<string, number> = {};
  records.forEach((p) => {
    if (!Array.isArray(p?.diagnosis)) return;
    const found = p.diagnosis.some((d: any) => d.diagnosis === diagnosisName);
    if (!found) return;
    const date = new Date(p.createdAt);
    if (isNaN(date.getTime())) return;
    const key = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort(
      (a, b) =>
        new Date("1 " + a.label).getTime() - new Date("1 " + b.label).getTime(),
    );
};

const exportToCSV = (data: AnalyticsData[], filename: string) => {
  const csv = [
    "Label,Count",
    ...data.map((d) => `"${d.label}",${d.count}`),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Auto-insight generator ───────────────────────────────────────────────────
interface Insight {
  color: string;
  text: React.ReactNode;
}

const generateInsights = (state: AnalyticsState): Insight[] => {
  const insights: Insight[] = [];
  if (state.diagnoses[0]) {
    const top = state.diagnoses[0];
    const total = state.diagnoses.reduce((s, d) => s + d.count, 0);
    const pct = ((top.count / total) * 100).toFixed(0);
    insights.push({
      color: CHART_COLORS[0],
      text: (
        <>
          <strong>{top.label}</strong> is the most common diagnosis, accounting
          for {pct}% of all recorded cases.
        </>
      ),
    });
  }
  const ageGroups: Array<{ key: keyof AnalyticsState; label: string }> = [
    { key: "infant", label: "Infants (0–1)" },
    { key: "teen", label: "Teens (2–20)" },
    { key: "adult", label: "Adults (21–44)" },
    { key: "middleage", label: "Middle-aged (45–64)" },
    { key: "senior", label: "Seniors (65+)" },
  ];
  const groupTotals = ageGroups.map(({ key, label }) => ({
    label,
    total: (state[key] as AnalyticsData[]).reduce((s, d) => s + d.count, 0),
    top: (state[key] as AnalyticsData[])[0]?.label ?? "N/A",
  }));
  const dominant = [...groupTotals].sort((a, b) => b.total - a.total)[0];
  if (dominant && dominant.total > 0) {
    insights.push({
      color: CHART_COLORS[1],
      text: (
        <>
          <strong>{dominant.label}</strong> account for the most visits (
          {dominant.total} cases). Top diagnosis:{" "}
          <strong>{dominant.top}</strong>.
        </>
      ),
    });
  }
  if (state.male[0] && state.female[0]) {
    insights.push({
      color: CHART_COLORS[4],
      text: (
        <>
          Top diagnosis for <strong>males</strong>: {state.male[0].label} (
          {state.male[0].count} cases). For <strong>females</strong>:{" "}
          {state.female[0].label} ({state.female[0].count} cases).
        </>
      ),
    });
  }
  if (state.drugs[0]) {
    const totalDrugs = state.drugs.reduce((s, d) => s + d.count, 0);
    const pct = ((state.drugs[0].count / totalDrugs) * 100).toFixed(0);
    insights.push({
      color: CHART_COLORS[2],
      text: (
        <>
          <strong>{state.drugs[0].label}</strong> is the most prescribed drug,
          appearing in {pct}% of prescriptions.
        </>
      ),
    });
  }
  return insights;
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono">{title}</p>
          <p className="text-2xl font-bold text-slate-100">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  return (
    <Card className="bg-slate-900/20 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono text-slate-300 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          AUTO INSIGHTS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex gap-3 text-sm text-slate-300">
            <span
              className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: ins.color }}
            />
            <span>{ins.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Top-5 bar chart
function Top5BarChart({ data }: { data: AnalyticsData[] }) {
  const top5 = data.slice(0, 5);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={top5}
        barCategoryGap="25%"
        margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          interval={0}
          // Truncate long labels on the axis
          tickFormatter={(v: string) =>
            v.length > 12 ? v.slice(0, 11) + "…" : v
          }
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
          labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="count"
            position="top"
            fill="#94a3b8"
            fontSize={10}
            fontFamily="monospace"
          />
          {top5.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Top-5 pie / donut chart
function Top5PieChart({ data }: { data: AnalyticsData[] }) {
  const top5 = data.slice(0, 5);
  const total = top5.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
          >
            {top5.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="space-y-1.5">
        {top5.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 text-xs font-mono"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              <span className="text-slate-300 truncate">{d.label}</span>
            </div>
            <span className="text-slate-500 flex-shrink-0">
              {((d.count / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full sortable bar list with show-more
function BarList({
  data,
  onItemClick,
  exportFilename,
  showExport = false,
  title,
  description,
}: {
  data: AnalyticsData[];
  onItemClick?: (label: string) => void;
  exportFilename?: string;
  showExport?: boolean;
  title: string;
  description?: string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const total = data.reduce((s, d) => s + d.count, 0);
  const display = showAll ? data : data.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          {title && (
            <h3 className="text-sm font-mono font-semibold text-slate-200">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {showExport && exportFilename && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportToCSV(data, exportFilename)}
            className="text-slate-400 hover:text-emerald-400 h-7 px-2 text-xs gap-1"
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {display.map((item, i) => (
          <div
            key={i}
            onClick={() => onItemClick?.(item.label)}
            className={`flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2 transition-all ${
              onItemClick
                ? "cursor-pointer hover:bg-slate-800/60 hover:border-emerald-700/50 group"
                : ""
            }`}
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span
              className={`text-sm font-mono flex-1 truncate ${onItemClick ? "text-slate-300 group-hover:text-emerald-400" : "text-slate-300"}`}
            >
              {item.label}
            </span>
            <div className="hidden md:block w-28">
              <Progress
                value={(item.count / total) * 100}
                className="h-1.5 bg-slate-800"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 w-14 text-right">
              {item.count} cases
            </span>
            <span className="text-xs font-mono text-slate-600 w-10 text-right">
              {((item.count / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      {data.length > 8 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs h-7 px-2 w-full"
        >
          {showAll ? "Show less" : `Show all ${data.length} records`}
          <ChevronDownIcon
            className={`ml-1 h-3 w-3 transition-transform ${showAll ? "rotate-180" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}

// Comparison trend chart (multi-series area)
function ComparisonTrendChart({
  seriesMap,
  selected,
}: {
  seriesMap: Record<string, AnalyticsData[]>;
  selected: string[];
}) {
  if (!selected.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm font-mono gap-2">
        <TrendingUp className="h-8 w-8 opacity-30" />
        <span>
          Click any diagnosis in the list above to view its monthly trend
        </span>
      </div>
    );
  }

  const allMonths = Array.from(
    new Set(
      selected.flatMap((name) => (seriesMap[name] ?? []).map((d) => d.label)),
    ),
  ).sort((a, b) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime());

  const merged = allMonths.map((month) => {
    const row: Record<string, any> = { month };
    selected.forEach((name) => {
      const point = (seriesMap[name] ?? []).find((d) => d.label === month);
      row[name] = point?.count ?? 0;
    });
    return row;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {selected.map((name, i) => (
          <span
            key={name}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            {name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={merged}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {selected.map((name, i) => (
              <linearGradient
                key={name}
                id={`grad-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
          />
          {selected.map((name, i) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              fill={`url(#grad-${i})`}
              dot={{
                r: 3,
                fill: CHART_COLORS[i % CHART_COLORS.length],
                strokeWidth: 0,
              }}
              activeDot={{ r: 5 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Reusable section layout: charts row + full list + optional trend ─────────
// This is the shared layout used by every tab.
function AnalyticsSection({
  data,
  title,
  description,
  listTitle,
  listDescription,
  exportFilename,
  trendSeriesMap,
  selectedTrends,
  onTrendToggle,
  onTrendClear,
  showTrendSection = false,
}: {
  data: AnalyticsData[];
  title: string;
  description?: string;
  listTitle: string;
  listDescription?: string;
  exportFilename: string;
  trendSeriesMap?: Record<string, AnalyticsData[]>;
  selectedTrends?: string[];
  onTrendToggle?: (label: string) => void;
  onTrendClear?: () => void;
  showTrendSection?: boolean;
}) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm font-mono gap-2">
        <BarChart3 className="h-8 w-8 opacity-30" />
        <span>No data available for the selected period</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Row 1: Top-5 charts side by side ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-mono font-semibold text-slate-200">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900/30 border-slate-800">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-mono text-slate-400">
                TOP 5 — BAR
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <Top5BarChart data={data} />
            </CardContent>
          </Card>
          <Card className="bg-slate-900/30 border-slate-800">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-mono text-slate-400">
                TOP 5 — DISTRIBUTION
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Top5PieChart data={data} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 2: Full list ──────────────────────────────────────────────── */}
      <Card className="bg-slate-900/20 border-slate-800">
        <CardContent className="p-5">
          <BarList
            data={data}
            title={listTitle}
            description={listDescription}
            onItemClick={showTrendSection ? onTrendToggle : undefined}
            showExport
            exportFilename={exportFilename}
          />
        </CardContent>
      </Card>

      {/* ── Row 3: Trend comparison (only shown on tabs that opt in) ─────── */}
      {showTrendSection && trendSeriesMap && selectedTrends !== undefined && (
        <Card className="bg-slate-900/20 border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-mono text-slate-200 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  MONTHLY TREND COMPARISON
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">
                  Click any row in the list above to add it here • up to 3
                  diagnoses
                </CardDescription>
              </div>
              {selectedTrends.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTrendClear}
                  className="text-slate-500 hover:text-red-400 text-xs h-7 px-2"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
            {selectedTrends.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTrends.map((name, i) => (
                  <span
                    key={name}
                    onClick={() => onTrendToggle?.(name)}
                    className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-full cursor-pointer border"
                    style={{
                      backgroundColor:
                        CHART_COLORS[i % CHART_COLORS.length] + "22",
                      color: CHART_COLORS[i % CHART_COLORS.length],
                      borderColor: CHART_COLORS[i % CHART_COLORS.length] + "55",
                    }}
                  >
                    {name} <X className="h-3 w-3 opacity-60" />
                  </span>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ComparisonTrendChart
              seriesMap={trendSeriesMap}
              selected={selectedTrends}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);

  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

  const [selectedGraph, setSelectedGraph] = React.useState<
    "diagnosis" | "prescription" | "drugs" | "age" | "gender"
  >("diagnosis");

  const [selectedAgeGroup, setSelectedAgeGroup] = React.useState<
    "general" | "infant" | "teen" | "adult" | "middleage" | "senior"
  >("general");

  // Trend state: each tab that supports trends has its own selected set
  const [diagnosisTrends, setDiagnosisTrends] = React.useState<string[]>([]);
  const [prescriptionTrends, setPrescriptionTrends] = React.useState<string[]>(
    [],
  );
  const [ageTrends, setAgeTrends] = React.useState<string[]>([]);
  const [maleTrends, setMaleTrends] = React.useState<string[]>([]);
  const [femaleTrends, setFemaleTrends] = React.useState<string[]>([]);

  const [analytics, setAnalytics] = React.useState<AnalyticsState>({
    diagnoses: [],
    prescriptions: [],
    drugs: [],
    ages: [],
    genders: [],
    infant: [],
    teen: [],
    adult: [],
    middleage: [],
    senior: [],
    male: [],
    female: [],
    trendByDiagnosis: {},
  });

  // Keep a ref to the latest filtered patient records so toggleTrend can
  // compute trends without re-running the full Firebase effect.
  const filteredPatientsRef = React.useRef<any[]>([]);

  const filterByDate = React.useCallback(
    (arr: any[]) => {
      let out = arr;
      if (startDate)
        out = out.filter((p) => new Date(p.createdAt) >= startDate);
      if (endDate) out = out.filter((p) => new Date(p.createdAt) <= endDate);
      return out;
    },
    [startDate, endDate],
  );

  // Generic trend toggle used by all tabs
  const makeToggleTrend =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (diagnosisName: string) => {
      setter((prev) => {
        const removing = prev.includes(diagnosisName);
        const next = removing
          ? prev.filter((n) => n !== diagnosisName)
          : prev.length >= 3
            ? [...prev.slice(1), diagnosisName]
            : [...prev, diagnosisName];

        if (!removing) {
          // Pre-compute trend for the new name if not already stored
          setAnalytics((a) => {
            if (a.trendByDiagnosis[diagnosisName]) return a;
            const trend = getDiagnosisTrend(
              filteredPatientsRef.current,
              diagnosisName,
            );
            return {
              ...a,
              trendByDiagnosis: {
                ...a.trendByDiagnosis,
                [diagnosisName]: trend,
              },
            };
          });
        }
        return next;
      });
    };

  const toggleDiagnosisTrend = React.useMemo(
    () => makeToggleTrend(setDiagnosisTrends),
    [],
  );
  const togglePrescriptionTrend = React.useMemo(
    () => makeToggleTrend(setPrescriptionTrends),
    [],
  );
  const toggleAgeTrend = React.useMemo(() => makeToggleTrend(setAgeTrends), []);
  const toggleMaleTrend = React.useMemo(
    () => makeToggleTrend(setMaleTrends),
    [],
  );
  const toggleFemaleTrend = React.useMemo(
    () => makeToggleTrend(setFemaleTrends),
    [],
  );

  // Firebase subscription
  React.useEffect(() => {
    if (!user) return;

    const patientRef = ref(db, "patients");
    const prescriptionRef = ref(db, "prescriptions");

    const unsubPatients = onValue(patientRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLoading(false);
        return;
      }

      const all: any[] = Object.values(data);
      const filtered = filterByDate(all);
      filteredPatientsRef.current = filtered;

      const maleMap: Record<string, number> = {};
      const femaleMap: Record<string, number> = {};
      const infantMap: Record<string, number> = {};
      const teenMap: Record<string, number> = {};
      const adultMap: Record<string, number> = {};
      const middleMap: Record<string, number> = {};
      const seniorMap: Record<string, number> = {};

      filtered.forEach((p: any) => {
        const gender = String(p.gender ?? "").toLowerCase();
        const age = Number(p.age);
        if (!Array.isArray(p.diagnosis)) return;
        p.diagnosis.forEach((d: any) => {
          const dx = d?.diagnosis?.trim();
          if (!dx) return;
          if (gender === "male") maleMap[dx] = (maleMap[dx] || 0) + 1;
          if (gender === "female") femaleMap[dx] = (femaleMap[dx] || 0) + 1;
          if (age <= 1) infantMap[dx] = (infantMap[dx] || 0) + 1;
          else if (age <= 20) teenMap[dx] = (teenMap[dx] || 0) + 1;
          else if (age <= 44) adultMap[dx] = (adultMap[dx] || 0) + 1;
          else if (age <= 64) middleMap[dx] = (middleMap[dx] || 0) + 1;
          else seniorMap[dx] = (seniorMap[dx] || 0) + 1;
        });
      });

      setAnalytics((prev) => {
        // Refresh any already-selected trends against new filtered data
        const updatedTrends = { ...prev.trendByDiagnosis };
        [
          ...diagnosisTrends,
          ...prescriptionTrends,
          ...ageTrends,
          ...maleTrends,
          ...femaleTrends,
        ].forEach((name) => {
          updatedTrends[name] = getDiagnosisTrend(filtered, name);
        });

        return {
          ...prev,
          diagnoses: getDiagnosisCounts(filtered),
          genders: getGenderCounts(filtered),
          ages: getAgeCounts(filtered),
          male: mapToArray(maleMap),
          female: mapToArray(femaleMap),
          infant: mapToArray(infantMap),
          teen: mapToArray(teenMap),
          adult: mapToArray(adultMap),
          middleage: mapToArray(middleMap),
          senior: mapToArray(seniorMap),
          trendByDiagnosis: updatedTrends,
        };
      });
      setLoading(false);
    });

    const unsubPrescriptions = onValue(prescriptionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const filtered = filterByDate(Object.values(data));
      setAnalytics((prev) => ({
        ...prev,
        prescriptions: getDiagnosisCounts(filtered),
        drugs: getDrugCounts(filtered),
      }));
    });

    return () => {
      unsubPatients();
      unsubPrescriptions();
    };
  }, [user, startDate, endDate]);

  const insights = React.useMemo(
    () => generateInsights(analytics),
    [analytics],
  );

  const totalDiagnoses = analytics.diagnoses.reduce((s, d) => s + d.count, 0);
  const totalDrugs = analytics.drugs.reduce((s, d) => s + d.count, 0);
  const totalPrescriptions = analytics.prescriptions.reduce(
    (s, d) => s + d.count,
    0,
  );

  const ageDataMap = {
    general: analytics.ages,
    infant: analytics.infant,
    teen: analytics.teen,
    adult: analytics.adult,
    middleage: analytics.middleage,
    senior: analytics.senior,
  } as const;

  const ageTitles = {
    general: "Most frequent ages recorded",
    infant: "Most common diagnoses — infants (0–1)",
    teen: "Most common diagnoses — teens (2–20)",
    adult: "Most common diagnoses — adults (21–44)",
    middleage: "Most common diagnoses — middle age (45–64)",
    senior: "Most common diagnoses — seniors (65+)",
  } as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-mono text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-mono font-bold text-slate-100 tracking-tight">
                MEDICAL RECORDS ANALYTICS
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Medical Records &amp; Prescriptions Analysis
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-700 !bg-emerald-600 text-slate-100 hover:bg-emerald-700 font-mono text-xs"
                >
                  {startDate ? startDate.toLocaleDateString() : "START DATE"}
                  <ChevronDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-slate-900 border-slate-800">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => {
                    setStartDate(d);
                    setOpenStart(false);
                  }}
                  className="bg-slate-900 text-slate-100"
                />
              </PopoverContent>
            </Popover>

            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-700 !bg-emerald-600 text-slate-100 hover:bg-emerald-700 font-mono text-xs"
                >
                  {endDate ? endDate.toLocaleDateString() : "END DATE"}
                  <ChevronDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-slate-900 border-slate-800">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => {
                    setEndDate(d);
                    setOpenEnd(false);
                  }}
                  className="bg-slate-900 text-slate-100"
                />
              </PopoverContent>
            </Popover>

            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                className="text-slate-400 hover:text-red-400 text-xs font-mono"
              >
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ── Metric cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="TOTAL DIAGNOSES"
            value={totalDiagnoses}
            icon={Activity}
          />
          <MetricCard
            title="UNIQUE DIAGNOSES"
            value={analytics.diagnoses.length}
            icon={List}
          />
          <MetricCard
            title="PRESCRIPTIONS"
            value={totalPrescriptions}
            icon={ScrollText}
          />
          <MetricCard
            title="UNIQUE DRUGS"
            value={analytics.drugs.length}
            icon={Zap}
          />
        </div>

        {/* ── Auto insights ──────────────────────────────────────────────────── */}
        <InsightsPanel insights={insights} />

        {/* ── Tab navigation ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {(
            [
              { id: "diagnosis", label: "DIAGNOSES", icon: Activity },
              { id: "prescription", label: "PRESCRIPTIONS", icon: ScrollText },
              { id: "drugs", label: "DRUGS", icon: Zap },
              { id: "age", label: "AGE GROUPS", icon: BarChart3 },
              { id: "gender", label: "GENDER", icon: Users },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              variant={selectedGraph === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedGraph(tab.id)}
              className={`gap-2 font-mono text-sm ${
                selectedGraph === tab.id
                  ? "!bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "!text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            DIAGNOSIS TAB
            Layout: top-5 bar + pie → full list → trend comparison
        ════════════════════════════════════════════════════════════════════ */}
        {selectedGraph === "diagnosis" && (
          <AnalyticsSection
            data={analytics.diagnoses}
            title="Top 5 diagnoses"
            description="Most frequently recorded across all patients"
            listTitle="All diagnoses"
            listDescription="Click any row to add it to the trend comparison below"
            exportFilename="diagnoses"
            trendSeriesMap={analytics.trendByDiagnosis}
            selectedTrends={diagnosisTrends}
            onTrendToggle={toggleDiagnosisTrend}
            onTrendClear={() => setDiagnosisTrends([])}
            showTrendSection
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PRESCRIPTION TAB
        ════════════════════════════════════════════════════════════════════ */}
        {selectedGraph === "prescription" && (
          <AnalyticsSection
            data={analytics.prescriptions}
            title="Top 5 prescription diagnoses"
            description="Most frequent diagnoses across all prescriptions"
            listTitle="All prescription diagnoses"
            exportFilename="prescriptions"
            trendSeriesMap={analytics.trendByDiagnosis}
            selectedTrends={prescriptionTrends}
            onTrendToggle={togglePrescriptionTrend}
            onTrendClear={() => setPrescriptionTrends([])}
            showTrendSection
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            DRUGS TAB — no trend (drugs aren't diagnoses, trend would be misleading)
        ════════════════════════════════════════════════════════════════════ */}
        {selectedGraph === "drugs" && (
          <AnalyticsSection
            data={analytics.drugs}
            title="Top 5 prescribed drugs"
            description="Most frequently prescribed across all records"
            listTitle="All prescribed drugs"
            exportFilename="drugs"
            showTrendSection={false}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════════
            AGE TAB
        ════════════════════════════════════════════════════════════════════ */}
        {selectedGraph === "age" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "general", label: "General" },
                  { id: "infant", label: "Infant (0–1)" },
                  { id: "teen", label: "Teen (2–20)" },
                  { id: "adult", label: "Adult (21–44)" },
                  { id: "middleage", label: "Middle age (45–64)" },
                  { id: "senior", label: "Senior (65+)" },
                ] as const
              ).map((g) => (
                <Button
                  key={g.id}
                  variant={selectedAgeGroup === g.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedAgeGroup(g.id);
                    setAgeTrends([]);
                  }}
                  className={`text-xs font-mono ${
                    selectedAgeGroup === g.id
                      ? "!bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {g.label}
                </Button>
              ))}
            </div>
            <AnalyticsSection
              data={ageDataMap[selectedAgeGroup]}
              title={`Top 5 — ${ageTitles[selectedAgeGroup].split("—")[1]?.trim() ?? ageTitles[selectedAgeGroup]}`}
              description="Most common diagnoses in this age group"
              listTitle={ageTitles[selectedAgeGroup]}
              listDescription={
                selectedAgeGroup !== "general"
                  ? "Click any row to view monthly trend below"
                  : undefined
              }
              exportFilename={`age-${selectedAgeGroup}`}
              trendSeriesMap={analytics.trendByDiagnosis}
              selectedTrends={ageTrends}
              onTrendToggle={
                selectedAgeGroup !== "general" ? toggleAgeTrend : undefined
              }
              onTrendClear={() => setAgeTrends([])}
              showTrendSection={selectedAgeGroup !== "general"}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            GENDER TAB — side-by-side male / female, each with their own trend
        ════════════════════════════════════════════════════════════════════ */}
        {selectedGraph === "gender" && (
          <div className="space-y-6">
            {/* Overall gender split */}
            <AnalyticsSection
              data={analytics.genders}
              title="Overall gender distribution"
              description="Total patient breakdown by gender"
              listTitle="Gender breakdown"
              exportFilename="gender-distribution"
              showTrendSection={false}
            />

            {/* Male diagnoses */}
            <Card className="bg-slate-900/20 border-slate-800">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-mono text-blue-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />
                  MALE — DIAGNOSIS BREAKDOWN
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <AnalyticsSection
                  data={analytics.male}
                  title="Top 5 — male"
                  listTitle="All male diagnoses"
                  listDescription="Click any row to view monthly trend below"
                  exportFilename="diagnoses-male"
                  trendSeriesMap={analytics.trendByDiagnosis}
                  selectedTrends={maleTrends}
                  onTrendToggle={toggleMaleTrend}
                  onTrendClear={() => setMaleTrends([])}
                  showTrendSection
                />
              </CardContent>
            </Card>

            {/* Female diagnoses */}
            <Card className="bg-slate-900/20 border-slate-800">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-mono text-pink-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-400 inline-block" />
                  FEMALE — DIAGNOSIS BREAKDOWN
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <AnalyticsSection
                  data={analytics.female}
                  title="Top 5 — female"
                  listTitle="All female diagnoses"
                  listDescription="Click any row to view monthly trend below"
                  exportFilename="diagnoses-female"
                  trendSeriesMap={analytics.trendByDiagnosis}
                  selectedTrends={femaleTrends}
                  onTrendToggle={toggleFemaleTrend}
                  onTrendClear={() => setFemaleTrends([])}
                  showTrendSection
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
