"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts";

import { db } from "@/firebaseConfig";
import { ref, onValue, push } from "firebase/database";

import { useAuth } from "@/auth/authprovider";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TrendingUp,
  PlusCircle,
  ChevronDown,
  Server,
  Zap,
  Activity,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  List,
  ScrollText,
} from "lucide-react";

import { Calendar } from "./ui/calendar";

import { ChevronDownIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Industrial/Tech color scheme inspired by the image
const COLORS = {
  primary: "#00a896", // Bright teal - like the progress bars
  secondary: "#028090", // Darker teal
  accent: "#05668d", // Deep blue
  warning: "#D1552E", // Orange/amber
  darkBg: "#0f172a", // Dark background like the terminal feel
  cardBg: "#1e293b", // Card background
  border: "#334155", // Border color
  text: "#f8fafc", // Light text
  textMuted: "#94a3b8", // Muted text
  gridLine: "#334155", // Grid line color
  // Chart colors
  chartColors: [
    "#00a896",
    "#028090",
    "#05668d",
    "#D1552E",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
  ],
};

// Helper functions remain the same
const getDiagnosisCounts = (records: any[]) => {
  const countMap: Record<string, number> = {};

  records.forEach((p) => {
    if (!Array.isArray(p?.diagnosis)) return;

    p.diagnosis.forEach((d: { diagnosis: string }) => {
      const name = d.diagnosis?.trim();
      if (!name) return;

      countMap[name] = (countMap[name] || 0) + 1;
    });
  });

  return Object.entries(countMap)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

const getDrugCounts = (records: any[]) => {
  const countMap: Record<string, number> = {};

  records.forEach((p) => {
    if (!Array.isArray(p?.drugs)) return;

    p.drugs.forEach((d: { medicine: string }) => {
      const name = d.medicine?.trim();
      if (!name) return;

      countMap[name] = (countMap[name] || 0) + 1;
    });
  });

  return Object.entries(countMap)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

const getGenderCounts = (records: any[]) => {
  const countMap: Record<string, number> = {};

  records.forEach((p) => {
    const gender = p.gender?.trim();
    if (!gender) return;

    countMap[gender] = (countMap[gender] || 0) + 1;
  });

  return Object.entries(countMap)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

const getDiagnosisTrend = (records: any[], diagnosisName: string) => {
  const countMap: Record<string, number> = {};

  records.forEach((p) => {
    if (!Array.isArray(p?.diagnosis)) return;

    const found = p.diagnosis.some((d: any) => d.diagnosis === diagnosisName);

    if (!found) return;

    const month = new Date(p.createdAt).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    countMap[month] = (countMap[month] || 0) + 1;
  });

  return Object.entries(countMap).map(([label, count]) => ({
    label,
    count,
  }));
};

const getAgeCounts = (records: any[]) => {
  const countMap: Record<string, number> = {};

  records.forEach((p) => {
    const age = p.age?.toString().trim();
    if (!age) return;

    countMap[age] = (countMap[age] || 0) + 1;
  });

  return Object.entries(countMap)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// Custom components with industrial styling
function AnalyticsMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-mono">{title}</p>
            <p className="text-2xl font-bold text-slate-100">
              {value}
              {unit && (
                <span className="text-sm text-slate-400 ml-1">{unit}</span>
              )}
            </p>
            {trend && (
              <p
                className={`text-xs ${trend.isPositive ? "text-emerald-400" : "text-red-400"} mt-1`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Icon className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DiagnosticsTable({
  data,
  onItemClick,
}: {
  data: AnalyticsData[];
  onItemClick?: (label: string) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div
          key={index}
          className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2 hover:bg-slate-800/50 transition-all cursor-pointer"
          onClick={() => onItemClick?.(item.label)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  COLORS.chartColors[index % COLORS.chartColors.length],
              }}
            />
            <span className="text-sm font-mono text-slate-300 group-hover:text-emerald-400 transition-colors">
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 hidden md:block">
              <Progress
                value={(item.count / total) * 100}
                className="h-1.5 bg-slate-800"
              />
            </div>
            <span className="text-sm font-mono text-slate-400 min-w-[60px] text-right">
              {item.count} cases
            </span>
            <span className="text-xs font-mono text-slate-500 min-w-[45px] text-right">
              {((item.count / total) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsBarChartDark({ data }: { data: AnalyticsData[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: "#fdfeff" }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: "#ffffff" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            borderColor: "#334155",
            borderRadius: "8px",
            color: "#f8fafc",
          }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#00a896" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="count"
            position="top"
            fill="#ffffff"
            fontSize={11}
            fontFamily="monospace"
          />
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS.chartColors[index % COLORS.chartColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AnalyticsPieChartDark({ data }: { data: AnalyticsData[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: "#475569", strokeWidth: 1 }}
        >
          {data.map((_, idx) => (
            <Cell
              key={idx}
              fill={COLORS.chartColors[idx % COLORS.chartColors.length]}
              stroke="#1e293b"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            borderColor: "#334155",
            borderRadius: "8px",
            color: "#f8fafc",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DiagnosisTrendChartDark({ data }: { data: AnalyticsData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00a896" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00a896" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: "#334155" }}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
          axisLine={{ stroke: "#334155" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            borderRadius: "8px",
            color: "#f8fafc",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#00a896"
          strokeWidth={2}
          fill="url(#trendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface AnalyticsData {
  label: string;
  count: number;
  date?: string;
}

interface AnalyticsSectionProps {
  data: AnalyticsData[];
  chart?: "bar" | "pie";
  title: string;
  description: string;
  itemLabel: string;
  buttonText?: string;
  onItemClick?: (label: string) => void;
  onShowAll?: () => void;
  showAllButton?: boolean;
}

function AnalyticsSection({
  data,
  chart = "bar",
  title,
  description,
  itemLabel,
  buttonText,
  onItemClick,
  onShowAll,
  showAllButton = false,
}: AnalyticsSectionProps) {
  const [showFullList, setShowFullList] = React.useState(false);

  const displayData = showFullList ? data : data.slice(0, 5);
  const topItem = data.length > 0 ? data[0] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="w-full lg:w-1/2 bg-slate-900/30 rounded-xl p-4 border border-slate-800">
        {chart === "pie" ? (
          <AnalyticsPieChartDark data={displayData} />
        ) : (
          <AnalyticsBarChartDark data={displayData} />
        )}
      </div>

      <div className="w-full lg:w-1/2 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 font-mono tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>

        {/* Top Record Card */}
        {topItem && (
          <Card className="bg-slate-900/30 border-emerald-500/30">
            <CardContent className="p-4">
              <p className="text-xs text-slate-400 font-mono mb-1">
                {itemLabel}
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {topItem.label}
              </p>
              <p className="text-sm text-slate-400">
                {topItem.count} recorded cases
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scrollable Records List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-semibold text-sm text-slate-300 font-mono">
              Records
            </h4>
            {showAllButton && data.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullList(!showFullList)}
                className="text-emerald-400 hover:!text-emerald-300 hover:!bg-emerald-500/10 h-7 px-2 text-xs"
              >
                {showFullList ? "Show Less" : "Show All"}
                <ChevronDownIcon
                  className={`ml-1 h-3 w-3 transition-transform ${showFullList ? "rotate-180" : ""}`}
                />
              </Button>
            )}
          </div>
          <ScrollArea className="h-[280px]">
            <div className="p-3 space-y-2">
              <DiagnosticsTable data={displayData} onItemClick={onItemClick} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Full Diagnosis Analytics Modal/Drawer component
function FullDiagnosisAnalytics({
  data,
  open,
  onClose,
  onItemClick,
}: {
  data: AnalyticsData[];
  open: boolean;
  onClose: () => void;
  onItemClick?: (label: string) => void;
}) {
  if (!open) return null;

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-[90vw] max-w-4xl max-h-[85vh] bg-slate-950 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-mono text-slate-100">
                Complete Diagnosis Analytics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Full breakdown of all recorded diagnoses
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">
                Total Diagnoses
              </p>
              <p className="text-2xl font-bold text-emerald-400">{total}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">
                Unique Diagnoses
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {data.length}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
              <p className="text-xs text-slate-400 font-mono">
                Average per Diagnosis
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {(total / data.length).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Full Table */}
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-3 border-b border-slate-800 grid grid-cols-12 text-xs font-mono text-slate-400">
              <div className="col-span-5">Diagnosis Name</div>
              <div className="col-span-3 text-right">Cases</div>
              <div className="col-span-4 text-right">Percentage</div>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-slate-800">
                {data.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 grid grid-cols-12 items-center hover:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => {
                      onItemClick?.(item.label);
                      onClose();
                    }}
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS.chartColors[idx % COLORS.chartColors.length],
                        }}
                      />
                      <span className="text-sm text-slate-300 font-mono">
                        {item.label}
                      </span>
                    </div>
                    <div className="col-span-3 text-right text-sm text-slate-400">
                      {item.count}
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(item.count / total) * 100}
                          className="h-1.5 !bg-emerald-800 flex-1"
                        />
                        <span className="text-xs text-slate-400 min-w-[45px] text-right !bg-emerald-600">
                          {((item.count / total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);
  const [showFullDiagnosisModal, setShowFullDiagnosisModal] =
    React.useState(false);

  const [selectedGraph, setSelectedGraph] = React.useState<
    "diagnosis" | "prescription" | "drugs" | "age" | "gender"
  >("diagnosis");

  const [selectedAgeGroup, setSelectedAgeGroup] = React.useState<
    "general" | "infant" | "teen" | "adult" | "middleage" | "senior"
  >("general");

  const [analytics, setAnalytics] = React.useState({
    diagnoses: [] as AnalyticsData[],
    prescriptions: [] as AnalyticsData[],
    drugs: [] as AnalyticsData[],
    ages: [] as AnalyticsData[],
    genders: [] as AnalyticsData[],
    diagnosisTrend: [] as AnalyticsData[],
    infant: [] as AnalyticsData[],
    teen: [] as AnalyticsData[],
    adult: [] as AnalyticsData[],
    middleage: [] as AnalyticsData[],
    senior: [] as AnalyticsData[],
    male: [] as AnalyticsData[],
    female: [] as AnalyticsData[],
  });

  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState("");

  const filterByDate = (arr: any[]) => {
    let filtered = arr;
    if (startDate) {
      filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate);
    }
    return filtered;
  };

  const convertMapToArray = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  const handleDiagnosisClick = React.useCallback(
    (diagnosisName: string) => {
      if (!user) return;

      const patientRef = ref(db, "patients");
      onValue(
        patientRef,
        (snapshot) => {
          const data = snapshot.val();
          if (!data) return;

          const filtered = filterByDate(Object.values(data));
          const trend = getDiagnosisTrend(filtered, diagnosisName);

          setAnalytics((prev) => ({
            ...prev,
            diagnosisTrend: trend,
          }));
          setSelectedDiagnosis(diagnosisName);
        },
        { onlyOnce: true },
      );
    },
    [user, startDate, endDate],
  );

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

      const filtered = filterByDate(Object.values(data));

      const diagnoses = getDiagnosisCounts(filtered);
      const genders = getGenderCounts(filtered);
      const ages = getAgeCounts(filtered);

      const maleMap: Record<string, number> = {};
      const femaleMap: Record<string, number> = {};
      const infantMap: Record<string, number> = {};
      const teenMap: Record<string, number> = {};
      const adultMap: Record<string, number> = {};
      const middleMap: Record<string, number> = {};
      const seniorMap: Record<string, number> = {};

      filtered.forEach((p: any) => {
        const gender = String(p.gender || "").toLowerCase();
        const age = Number(p.age);

        if (!Array.isArray(p.diagnosis)) return;

        p.diagnosis.forEach((d: any) => {
          const diagnosis = d?.diagnosis?.trim();
          if (!diagnosis) return;

          if (gender === "male") {
            maleMap[diagnosis] = (maleMap[diagnosis] || 0) + 1;
          }
          if (gender === "female") {
            femaleMap[diagnosis] = (femaleMap[diagnosis] || 0) + 1;
          }

          if (age <= 1) {
            infantMap[diagnosis] = (infantMap[diagnosis] || 0) + 1;
          } else if (age <= 20) {
            teenMap[diagnosis] = (teenMap[diagnosis] || 0) + 1;
          } else if (age <= 44) {
            adultMap[diagnosis] = (adultMap[diagnosis] || 0) + 1;
          } else if (age <= 64) {
            middleMap[diagnosis] = (middleMap[diagnosis] || 0) + 1;
          } else {
            seniorMap[diagnosis] = (seniorMap[diagnosis] || 0) + 1;
          }
        });
      });

      setAnalytics((prev) => ({
        ...prev,
        diagnoses,
        genders,
        ages,
        male: convertMapToArray(maleMap),
        female: convertMapToArray(femaleMap),
        infant: convertMapToArray(infantMap),
        teen: convertMapToArray(teenMap),
        adult: convertMapToArray(adultMap),
        middleage: convertMapToArray(middleMap),
        senior: convertMapToArray(seniorMap),
      }));

      setLoading(false);
    });

    const unsubPrescriptions = onValue(prescriptionRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const filtered = filterByDate(Object.values(data));

      const drugs = getDrugCounts(filtered);
      const prescriptions = getDiagnosisCounts(filtered);

      setAnalytics((prev) => ({
        ...prev,
        prescriptions,
        drugs,
      }));
    });

    return () => {
      unsubPatients();
      unsubPrescriptions();
    };
  }, [user, startDate, endDate]);

  const ageAnalyticsMap = {
    general: analytics.ages,
    infant: analytics.infant,
    teen: analytics.teen,
    adult: analytics.adult,
    middleage: analytics.middleage,
    senior: analytics.senior,
  };

  const ageTitles = {
    general: "Most Frequent Ages Recorded",
    infant: "Most Common Diagnoses for Infants",
    teen: "Most Common Diagnoses for Teens",
    adult: "Most Common Diagnoses for Adults",
    middleage: "Most Common Diagnoses for Middle Aged Persons",
    senior: "Most Common Diagnoses for Seniors",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-mono text-sm">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Section with Industrial Aesthetic */}
      <div className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold text-slate-100 tracking-tight">
                  MEDICAL RECORDS ANALYTICS
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Medical Records & Prescriptions Analysis
                </p>
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex gap-3">
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-700 !bg-emerald-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-mono text-xs"
                  >
                    {startDate ? startDate.toLocaleDateString() : "START DATE"}
                    <ChevronDownIcon className="ml-2 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-slate-900 border-slate-800">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
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
                    className="border-slate-700  !bg-emerald-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-mono text-xs"
                  >
                    {endDate ? endDate.toLocaleDateString() : "END DATE"}
                    <ChevronDownIcon className="ml-2 h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-slate-900 border-slate-800">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setOpenEnd(false);
                    }}
                    className="bg-slate-900 text-slate-100"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnalyticsMetricCard
            title="TOTAL DIAGNOSES"
            value={analytics.diagnoses.reduce((sum, d) => sum + d.count, 0)}
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
          />
          <AnalyticsMetricCard
            title="UNIQUE DIAGNOSES"
            value={analytics.diagnoses.length}
            icon={List}
          />
        </div>

        {/* Graph Selector - Tabs Style */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {[
            { id: "diagnosis", label: "DIAGNOSES", icon: Activity },
            { id: "prescription", label: "PRESCRIPTIONS", icon: ScrollText },
            { id: "drugs", label: "DRUGS", icon: Zap },
            { id: "age", label: "AGE GROUPS", icon: BarChart3 },
            { id: "gender", label: "GENDER", icon: PieChartIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedGraph === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedGraph(tab.id as any)}
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

        {/* DIAGNOSIS Section */}
        {selectedGraph === "diagnosis" && (
          <div className="space-y-6">
            <Card className="bg-slate-900/20 border-slate-800">
              <CardContent className="p-6">
                <AnalyticsSection
                  chart="pie"
                  data={analytics.diagnoses}
                  title="Top Patient Diagnoses"
                  description="Based on patient diagnosis records"
                  itemLabel="Most Common Diagnosis"
                  buttonText="Show Full Diagnosis Analytics"
                  onItemClick={handleDiagnosisClick}
                  onShowAll={() => setShowFullDiagnosisModal(true)}
                  showAllButton={true}
                />
              </CardContent>
            </Card>

            {/* Diagnosis Trend Section */}
            {selectedDiagnosis && analytics.diagnosisTrend.length > 0 && (
              <Card className="bg-slate-900/20 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-mono text-slate-100">
                    {selectedDiagnosis} Trend Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Monthly recorded cases over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiagnosisTrendChartDark data={analytics.diagnosisTrend} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* PRESCRIPTION Section */}
        {selectedGraph === "prescription" && (
          <Card className="bg-slate-900/20 border-slate-800">
            <CardContent className="p-6">
              <AnalyticsSection
                data={analytics.prescriptions}
                title="Top Prescription Diagnoses"
                description="Based on prescription records"
                itemLabel="Most Common Diagnosis"
                buttonText="Show Full Prescription Analytics"
                onItemClick={handleDiagnosisClick}
                showAllButton={true}
              />
            </CardContent>
          </Card>
        )}

        {/* DRUGS Section */}
        {selectedGraph === "drugs" && (
          <Card className="bg-slate-900/20 border-slate-800">
            <CardContent className="p-6">
              <AnalyticsSection
                data={analytics.drugs}
                title="Top Prescribed Drugs"
                description="Based on prescription frequency"
                itemLabel="Most Common Drug"
                buttonText="Show All Drugs"
                showAllButton={true}
              />
            </CardContent>
          </Card>
        )}

        {/* AGE Section */}
        {selectedGraph === "age" && (
          <Card className="bg-slate-900/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-slate-100">
                Patient Age Demographics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Diagnosis distribution across age groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "general", label: "General" },
                  { id: "infant", label: "Infant (0-1)" },
                  { id: "teen", label: "Teen (2-20)" },
                  { id: "adult", label: "Adult (21-44)" },
                  { id: "middleage", label: "Middle Age (45-64)" },
                  { id: "senior", label: "Senior (65+)" },
                ].map((group) => (
                  <Button
                    key={group.id}
                    variant={
                      selectedAgeGroup === group.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedAgeGroup(group.id as any)}
                    className={`text-xs font-mono ${
                      selectedAgeGroup === group.id
                        ? "!bg-emerald-600 hover:bg-emerald-700"
                        : "border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {group.label}
                  </Button>
                ))}
              </div>
              <AnalyticsSection
                data={ageAnalyticsMap[selectedAgeGroup]}
                title={ageTitles[selectedAgeGroup]}
                description="Based on patient medical records"
                itemLabel="Most Common Record"
                buttonText="Show Full Analytics"
                onItemClick={handleDiagnosisClick}
                showAllButton={true}
              />
            </CardContent>
          </Card>
        )}

        {/* GENDER Section */}
        {selectedGraph === "gender" && (
          <Card className="bg-slate-900/20 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-mono text-slate-100">
                Patient Gender Analysis
              </CardTitle>
              <CardDescription className="text-slate-400">
                Diagnosis distribution by gender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800">
                  <TabsTrigger
                    value="general"
                    className="data-[state=active]:!bg-emerald-600 text-white"
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="male"
                    className="data-[state=active]:!bg-emerald-600 text-white"
                  >
                    Male
                  </TabsTrigger>
                  <TabsTrigger
                    value="female"
                    className="data-[state=active]:!bg-emerald-600 text-white"
                  >
                    Female
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                  <AnalyticsSection
                    data={analytics.genders}
                    title="Gender Distribution"
                    description="Based on patient medical records"
                    itemLabel="Most Common Gender Recorded"
                    buttonText="Show Full Analytics"
                    showAllButton={true}
                  />
                </TabsContent>

                <TabsContent value="male" className="mt-6">
                  <AnalyticsSection
                    data={analytics.male}
                    title="Most Common Diagnoses for Males"
                    description="Based on patient medical records"
                    itemLabel="Most Common Record"
                    buttonText="Show Full Analytics"
                    onItemClick={handleDiagnosisClick}
                    showAllButton={true}
                  />
                </TabsContent>

                <TabsContent value="female" className="mt-6">
                  <AnalyticsSection
                    data={analytics.female}
                    title="Most Common Diagnoses for Females"
                    description="Based on patient medical records"
                    itemLabel="Most Common Record"
                    buttonText="Show Full Analytics"
                    onItemClick={handleDiagnosisClick}
                    showAllButton={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Diagnosis Modal */}
      <FullDiagnosisAnalytics
        data={analytics.diagnoses}
        open={showFullDiagnosisModal}
        onClose={() => setShowFullDiagnosisModal(false)}
        onItemClick={handleDiagnosisClick}
      />
    </div>
  );
}

// Missing import for Users icon
import { Users } from "lucide-react";
