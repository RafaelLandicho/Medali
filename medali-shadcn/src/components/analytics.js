"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LabelList, Area, AreaChart, } from "recharts";
import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Zap, Activity, BarChart3, PieChart as PieChartIcon, List, ScrollText, } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
const getDiagnosisCounts = (records) => {
    const countMap = {};
    records.forEach((p) => {
        if (!Array.isArray(p?.diagnosis))
            return;
        p.diagnosis.forEach((d) => {
            const name = d.diagnosis?.trim();
            if (!name)
                return;
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
const getDrugCounts = (records) => {
    const countMap = {};
    records.forEach((p) => {
        if (!Array.isArray(p?.drugs))
            return;
        p.drugs.forEach((d) => {
            const name = d.medicine?.trim();
            if (!name)
                return;
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
const getGenderCounts = (records) => {
    const countMap = {};
    records.forEach((p) => {
        const gender = p.gender?.trim();
        if (!gender)
            return;
        countMap[gender] = (countMap[gender] || 0) + 1;
    });
    return Object.entries(countMap)
        .map(([label, count]) => ({
        label,
        count,
    }))
        .sort((a, b) => b.count - a.count);
};
const getDiagnosisTrend = (records, diagnosisName) => {
    const countMap = {};
    records.forEach((p) => {
        if (!Array.isArray(p?.diagnosis))
            return;
        const found = p.diagnosis.some((d) => d.diagnosis === diagnosisName);
        if (!found)
            return;
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
const getAgeCounts = (records) => {
    const countMap = {};
    records.forEach((p) => {
        const age = p.age?.toString().trim();
        if (!age)
            return;
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
function AnalyticsMetricCard({ title, value, unit, icon: Icon, trend, }) {
    return (_jsx(Card, { className: "bg-slate-900/50 border-slate-800 backdrop-blur-sm", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400 font-mono", children: title }), _jsxs("p", { className: "text-2xl font-bold text-slate-100", children: [value, unit && (_jsx("span", { className: "text-sm text-slate-400 ml-1", children: unit }))] }), trend && (_jsxs("p", { className: `text-xs ${trend.isPositive ? "text-emerald-400" : "text-red-400"} mt-1`, children: [trend.isPositive ? "↑" : "↓", " ", trend.value, "%"] }))] }), _jsx("div", { className: "p-2 rounded-lg bg-emerald-500/10", children: _jsx(Icon, { className: "h-5 w-5 text-emerald-400" }) })] }) }) }));
}
function DiagnosticsTable({ data, onItemClick, }) {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return (_jsx("div", { className: "space-y-2", children: data.map((item, index) => (_jsxs("div", { className: "group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2 hover:bg-slate-800/50 transition-all cursor-pointer", onClick: () => onItemClick?.(item.label), children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: {
                                backgroundColor: COLORS.chartColors[index % COLORS.chartColors.length],
                            } }), _jsx("span", { className: "text-sm font-mono text-slate-300 group-hover:text-emerald-400 transition-colors", children: item.label })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-32 hidden md:block", children: _jsx(Progress, { value: (item.count / total) * 100, className: "h-1.5 bg-slate-800" }) }), _jsxs("span", { className: "text-sm font-mono text-slate-400 min-w-[60px] text-right", children: [item.count, " cases"] }), _jsxs("span", { className: "text-xs font-mono text-slate-500 min-w-[45px] text-right", children: [((item.count / total) * 100).toFixed(1), "%"] })] })] }, index))) }));
}
function AnalyticsBarChartDark({ data }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(BarChart, { data: data, barCategoryGap: "20%", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "label", tick: { fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }, axisLine: { stroke: "#fdfeff" } }), _jsx(YAxis, { tick: { fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }, axisLine: { stroke: "#ffffff" } }), _jsx(Tooltip, { contentStyle: {
                        backgroundColor: "#ffffff",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                    }, labelStyle: { color: "#94a3b8" }, itemStyle: { color: "#00a896" } }), _jsxs(Bar, { dataKey: "count", radius: [4, 4, 0, 0], children: [_jsx(LabelList, { dataKey: "count", position: "top", fill: "#ffffff", fontSize: 11, fontFamily: "monospace" }), data.map((_, index) => (_jsx(Cell, { fill: COLORS.chartColors[index % COLORS.chartColors.length] }, index)))] })] }) }));
}
function AnalyticsPieChartDark({ data }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "count", nameKey: "label", cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 2, label: ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`, labelLine: { stroke: "#475569", strokeWidth: 1 }, children: data.map((_, idx) => (_jsx(Cell, { fill: COLORS.chartColors[idx % COLORS.chartColors.length], stroke: "#1e293b", strokeWidth: 2 }, idx))) }), _jsx(Tooltip, { contentStyle: {
                        backgroundColor: "#ffffff",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                    } })] }) }));
}
function DiagnosisTrendChartDark({ data }) {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 350, children: _jsxs(AreaChart, { data: data, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "trendGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#00a896", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#00a896", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "label", tick: { fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }, axisLine: { stroke: "#334155" } }), _jsx(YAxis, { tick: { fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }, axisLine: { stroke: "#334155" } }), _jsx(Tooltip, { contentStyle: {
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                    } }), _jsx(Area, { type: "monotone", dataKey: "count", stroke: "#00a896", strokeWidth: 2, fill: "url(#trendGradient)" })] }) }));
}
function AnalyticsSection({ data, chart = "bar", title, description, itemLabel, buttonText, onItemClick, onShowAll, showAllButton = false, }) {
    const [showFullList, setShowFullList] = React.useState(false);
    const displayData = showFullList ? data : data.slice(0, 5);
    const topItem = data.length > 0 ? data[0] : null;
    return (_jsxs("div", { className: "flex flex-col lg:flex-row gap-6 items-start", children: [_jsx("div", { className: "w-full lg:w-1/2 bg-slate-900/30 rounded-xl p-4 border border-slate-800", children: chart === "pie" ? (_jsx(AnalyticsPieChartDark, { data: displayData })) : (_jsx(AnalyticsBarChartDark, { data: displayData })) }), _jsxs("div", { className: "w-full lg:w-1/2 space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-100 font-mono tracking-tight", children: title }), _jsx("p", { className: "text-sm text-slate-400", children: description })] }), topItem && (_jsx(Card, { className: "bg-slate-900/30 border-emerald-500/30", children: _jsxs(CardContent, { className: "p-4", children: [_jsx("p", { className: "text-xs text-slate-400 font-mono mb-1", children: itemLabel }), _jsx("p", { className: "text-2xl font-bold text-emerald-400", children: topItem.label }), _jsxs("p", { className: "text-sm text-slate-400", children: [topItem.count, " recorded cases"] })] }) })), _jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden", children: [_jsxs("div", { className: "p-3 border-b border-slate-800 flex items-center justify-between", children: [_jsx("h4", { className: "font-semibold text-sm text-slate-300 font-mono", children: "Records" }), showAllButton && data.length > 5 && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowFullList(!showFullList), className: "text-emerald-400 hover:!text-emerald-300 hover:!bg-emerald-500/10 h-7 px-2 text-xs", children: [showFullList ? "Show Less" : "Show All", _jsx(ChevronDownIcon, { className: `ml-1 h-3 w-3 transition-transform ${showFullList ? "rotate-180" : ""}` })] }))] }), _jsx(ScrollArea, { className: "h-[280px]", children: _jsx("div", { className: "p-3 space-y-2", children: _jsx(DiagnosticsTable, { data: displayData, onItemClick: onItemClick }) }) })] })] })] }));
}
// Full Diagnosis Analytics Modal/Drawer component
function FullDiagnosisAnalytics({ data, open, onClose, onItemClick, }) {
    if (!open)
        return null;
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", children: _jsxs(Card, { className: "w-[90vw] max-w-4xl max-h-[85vh] bg-slate-950 border-slate-800 overflow-hidden", children: [_jsx(CardHeader, { className: "border-b border-slate-800", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-xl font-mono text-slate-100", children: "Complete Diagnosis Analytics" }), _jsx(CardDescription, { className: "text-slate-400", children: "Full breakdown of all recorded diagnoses" })] }), _jsx(Button, { variant: "ghost", onClick: onClose, className: "text-slate-400 hover:text-slate-100", children: "\u2715" })] }) }), _jsxs(CardContent, { className: "p-6 overflow-auto", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4 border border-slate-800", children: [_jsx("p", { className: "text-xs text-slate-400 font-mono", children: "Total Diagnoses" }), _jsx("p", { className: "text-2xl font-bold text-emerald-400", children: total })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4 border border-slate-800", children: [_jsx("p", { className: "text-xs text-slate-400 font-mono", children: "Unique Diagnoses" }), _jsx("p", { className: "text-2xl font-bold text-emerald-400", children: data.length })] }), _jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4 border border-slate-800", children: [_jsx("p", { className: "text-xs text-slate-400 font-mono", children: "Average per Diagnosis" }), _jsx("p", { className: "text-2xl font-bold text-emerald-400", children: (total / data.length).toFixed(1) })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-800 overflow-hidden", children: [_jsxs("div", { className: "bg-slate-900 p-3 border-b border-slate-800 grid grid-cols-12 text-xs font-mono text-slate-400", children: [_jsx("div", { className: "col-span-5", children: "Diagnosis Name" }), _jsx("div", { className: "col-span-3 text-right", children: "Cases" }), _jsx("div", { className: "col-span-4 text-right", children: "Percentage" })] }), _jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "divide-y divide-slate-800", children: data.map((item, idx) => (_jsxs("div", { className: "p-3 grid grid-cols-12 items-center hover:bg-slate-900/50 transition-colors cursor-pointer", onClick: () => {
                                                onItemClick?.(item.label);
                                                onClose();
                                            }, children: [_jsxs("div", { className: "col-span-5 flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: {
                                                                backgroundColor: COLORS.chartColors[idx % COLORS.chartColors.length],
                                                            } }), _jsx("span", { className: "text-sm text-slate-300 font-mono", children: item.label })] }), _jsx("div", { className: "col-span-3 text-right text-sm text-slate-400", children: item.count }), _jsx("div", { className: "col-span-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: (item.count / total) * 100, className: "h-1.5 !bg-emerald-800 flex-1" }), _jsxs("span", { className: "text-xs text-slate-400 min-w-[45px] text-right !bg-emerald-600", children: [((item.count / total) * 100).toFixed(1), "%"] })] }) })] }, idx))) }) })] })] })] }) }));
}
export function Analytics() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [startDate, setStartDate] = React.useState();
    const [endDate, setEndDate] = React.useState();
    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] = React.useState(false);
    const [showFullDiagnosisModal, setShowFullDiagnosisModal] = React.useState(false);
    const [selectedGraph, setSelectedGraph] = React.useState("diagnosis");
    const [selectedAgeGroup, setSelectedAgeGroup] = React.useState("general");
    const [analytics, setAnalytics] = React.useState({
        diagnoses: [],
        prescriptions: [],
        drugs: [],
        ages: [],
        genders: [],
        diagnosisTrend: [],
        infant: [],
        teen: [],
        adult: [],
        middleage: [],
        senior: [],
        male: [],
        female: [],
    });
    const [selectedDiagnosis, setSelectedDiagnosis] = React.useState("");
    const filterByDate = (arr) => {
        let filtered = arr;
        if (startDate) {
            filtered = filtered.filter((p) => new Date(p.createdAt) >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter((p) => new Date(p.createdAt) <= endDate);
        }
        return filtered;
    };
    const convertMapToArray = (map) => Object.entries(map)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    const handleDiagnosisClick = React.useCallback((diagnosisName) => {
        if (!user)
            return;
        const patientRef = ref(db, "patients");
        onValue(patientRef, (snapshot) => {
            const data = snapshot.val();
            if (!data)
                return;
            const filtered = filterByDate(Object.values(data));
            const trend = getDiagnosisTrend(filtered, diagnosisName);
            setAnalytics((prev) => ({
                ...prev,
                diagnosisTrend: trend,
            }));
            setSelectedDiagnosis(diagnosisName);
        }, { onlyOnce: true });
    }, [user, startDate, endDate]);
    React.useEffect(() => {
        if (!user)
            return;
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
            const maleMap = {};
            const femaleMap = {};
            const infantMap = {};
            const teenMap = {};
            const adultMap = {};
            const middleMap = {};
            const seniorMap = {};
            filtered.forEach((p) => {
                const gender = String(p.gender || "").toLowerCase();
                const age = Number(p.age);
                if (!Array.isArray(p.diagnosis))
                    return;
                p.diagnosis.forEach((d) => {
                    const diagnosis = d?.diagnosis?.trim();
                    if (!diagnosis)
                        return;
                    if (gender === "male") {
                        maleMap[diagnosis] = (maleMap[diagnosis] || 0) + 1;
                    }
                    if (gender === "female") {
                        femaleMap[diagnosis] = (femaleMap[diagnosis] || 0) + 1;
                    }
                    if (age <= 1) {
                        infantMap[diagnosis] = (infantMap[diagnosis] || 0) + 1;
                    }
                    else if (age <= 20) {
                        teenMap[diagnosis] = (teenMap[diagnosis] || 0) + 1;
                    }
                    else if (age <= 44) {
                        adultMap[diagnosis] = (adultMap[diagnosis] || 0) + 1;
                    }
                    else if (age <= 64) {
                        middleMap[diagnosis] = (middleMap[diagnosis] || 0) + 1;
                    }
                    else {
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
            if (!data)
                return;
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
        return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" }), _jsx("p", { className: "text-slate-400 font-mono text-sm", children: "Loading analytics..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950", children: [_jsx("div", { className: "border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm sticky top-0 z-10", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-emerald-500/10", children: _jsx(Activity, { className: "h-5 w-5 text-emerald-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-mono font-bold text-slate-100 tracking-tight", children: "MEDICAL RECORDS ANALYTICS" }), _jsx("p", { className: "text-xs text-slate-400 font-mono", children: "Medical Records & Prescriptions Analysis" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Popover, { open: openStart, onOpenChange: setOpenStart, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "border-slate-700 !bg-emerald-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-mono text-xs", children: [startDate ? startDate.toLocaleDateString() : "START DATE", _jsx(ChevronDownIcon, { className: "ml-2 h-3 w-3" })] }) }), _jsx(PopoverContent, { className: "bg-slate-900 border-slate-800", children: _jsx(Calendar, { mode: "single", selected: startDate, onSelect: (date) => {
                                                        setStartDate(date);
                                                        setOpenStart(false);
                                                    }, className: "bg-slate-900 text-slate-100" }) })] }), _jsxs(Popover, { open: openEnd, onOpenChange: setOpenEnd, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "border-slate-700  !bg-emerald-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800 font-mono text-xs", children: [endDate ? endDate.toLocaleDateString() : "END DATE", _jsx(ChevronDownIcon, { className: "ml-2 h-3 w-3" })] }) }), _jsx(PopoverContent, { className: "bg-slate-900 border-slate-800", children: _jsx(Calendar, { mode: "single", selected: endDate, onSelect: (date) => {
                                                        setEndDate(date);
                                                        setOpenEnd(false);
                                                    }, className: "bg-slate-900 text-slate-100" }) })] })] })] }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(AnalyticsMetricCard, { title: "TOTAL DIAGNOSES", value: analytics.diagnoses.reduce((sum, d) => sum + d.count, 0), icon: Activity, trend: { value: 12, isPositive: true } }), _jsx(AnalyticsMetricCard, { title: "UNIQUE DIAGNOSES", value: analytics.diagnoses.length, icon: List })] }), _jsx("div", { className: "flex flex-wrap gap-2 border-b border-slate-800 pb-2", children: [
                            { id: "diagnosis", label: "DIAGNOSES", icon: Activity },
                            { id: "prescription", label: "PRESCRIPTIONS", icon: ScrollText },
                            { id: "drugs", label: "DRUGS", icon: Zap },
                            { id: "age", label: "AGE GROUPS", icon: BarChart3 },
                            { id: "gender", label: "GENDER", icon: PieChartIcon },
                        ].map((tab) => (_jsxs(Button, { variant: selectedGraph === tab.id ? "default" : "ghost", onClick: () => setSelectedGraph(tab.id), className: `gap-2 font-mono text-sm ${selectedGraph === tab.id
                                ? "!bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "!text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`, children: [_jsx(tab.icon, { className: "h-4 w-4" }), tab.label] }, tab.id))) }), selectedGraph === "diagnosis" && (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "bg-slate-900/20 border-slate-800", children: _jsx(CardContent, { className: "p-6", children: _jsx(AnalyticsSection, { chart: "pie", data: analytics.diagnoses, title: "Top Patient Diagnoses", description: "Based on patient diagnosis records", itemLabel: "Most Common Diagnosis", buttonText: "Show Full Diagnosis Analytics", onItemClick: handleDiagnosisClick, onShowAll: () => setShowFullDiagnosisModal(true), showAllButton: true }) }) }), selectedDiagnosis && analytics.diagnosisTrend.length > 0 && (_jsxs(Card, { className: "bg-slate-900/20 border-slate-800", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg font-mono text-slate-100", children: [selectedDiagnosis, " Trend Analysis"] }), _jsx(CardDescription, { className: "text-slate-400", children: "Monthly recorded cases over time" })] }), _jsx(CardContent, { children: _jsx(DiagnosisTrendChartDark, { data: analytics.diagnosisTrend }) })] }))] })), selectedGraph === "prescription" && (_jsx(Card, { className: "bg-slate-900/20 border-slate-800", children: _jsx(CardContent, { className: "p-6", children: _jsx(AnalyticsSection, { data: analytics.prescriptions, title: "Top Prescription Diagnoses", description: "Based on prescription records", itemLabel: "Most Common Diagnosis", buttonText: "Show Full Prescription Analytics", onItemClick: handleDiagnosisClick, showAllButton: true }) }) })), selectedGraph === "drugs" && (_jsx(Card, { className: "bg-slate-900/20 border-slate-800", children: _jsx(CardContent, { className: "p-6", children: _jsx(AnalyticsSection, { data: analytics.drugs, title: "Top Prescribed Drugs", description: "Based on prescription frequency", itemLabel: "Most Common Drug", buttonText: "Show All Drugs", showAllButton: true }) }) })), selectedGraph === "age" && (_jsxs(Card, { className: "bg-slate-900/20 border-slate-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg font-mono text-slate-100", children: "Patient Age Demographics" }), _jsx(CardDescription, { className: "text-slate-400", children: "Diagnosis distribution across age groups" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: [
                                            { id: "general", label: "General" },
                                            { id: "infant", label: "Infant (0-1)" },
                                            { id: "teen", label: "Teen (2-20)" },
                                            { id: "adult", label: "Adult (21-44)" },
                                            { id: "middleage", label: "Middle Age (45-64)" },
                                            { id: "senior", label: "Senior (65+)" },
                                        ].map((group) => (_jsx(Button, { variant: selectedAgeGroup === group.id ? "default" : "outline", onClick: () => setSelectedAgeGroup(group.id), className: `text-xs font-mono ${selectedAgeGroup === group.id
                                                ? "!bg-emerald-600 hover:bg-emerald-700"
                                                : "border-slate-700 text-slate-400 hover:text-slate-200"}`, children: group.label }, group.id))) }), _jsx(AnalyticsSection, { data: ageAnalyticsMap[selectedAgeGroup], title: ageTitles[selectedAgeGroup], description: "Based on patient medical records", itemLabel: "Most Common Record", buttonText: "Show Full Analytics", onItemClick: handleDiagnosisClick, showAllButton: true })] })] })), selectedGraph === "gender" && (_jsxs(Card, { className: "bg-slate-900/20 border-slate-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg font-mono text-slate-100", children: "Patient Gender Analysis" }), _jsx(CardDescription, { className: "text-slate-400", children: "Diagnosis distribution by gender" })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "general", className: "w-full", children: [_jsxs(TabsList, { className: "bg-slate-900 border border-slate-800", children: [_jsx(TabsTrigger, { value: "general", className: "data-[state=active]:!bg-emerald-600 text-white", children: "General" }), _jsx(TabsTrigger, { value: "male", className: "data-[state=active]:!bg-emerald-600 text-white", children: "Male" }), _jsx(TabsTrigger, { value: "female", className: "data-[state=active]:!bg-emerald-600 text-white", children: "Female" })] }), _jsx(TabsContent, { value: "general", className: "mt-6", children: _jsx(AnalyticsSection, { data: analytics.genders, title: "Gender Distribution", description: "Based on patient medical records", itemLabel: "Most Common Gender Recorded", buttonText: "Show Full Analytics", showAllButton: true }) }), _jsx(TabsContent, { value: "male", className: "mt-6", children: _jsx(AnalyticsSection, { data: analytics.male, title: "Most Common Diagnoses for Males", description: "Based on patient medical records", itemLabel: "Most Common Record", buttonText: "Show Full Analytics", onItemClick: handleDiagnosisClick, showAllButton: true }) }), _jsx(TabsContent, { value: "female", className: "mt-6", children: _jsx(AnalyticsSection, { data: analytics.female, title: "Most Common Diagnoses for Females", description: "Based on patient medical records", itemLabel: "Most Common Record", buttonText: "Show Full Analytics", onItemClick: handleDiagnosisClick, showAllButton: true }) })] }) })] }))] }), _jsx(FullDiagnosisAnalytics, { data: analytics.diagnoses, open: showFullDiagnosisModal, onClose: () => setShowFullDiagnosisModal(false), onItemClick: handleDiagnosisClick })] }));
}
