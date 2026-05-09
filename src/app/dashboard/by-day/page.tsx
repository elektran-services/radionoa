"use client";

import React from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Program = {
  id?: string;
  _id?: string;
  programName: string;
  days: string[];
  duration?: { start: string; end: string };
  oaps?: Array<string | { id?: string; _id?: string }>;
  programDetails?: string;
};

type OapItem = { id?: string; _id?: string; oapName: string };

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type DayName = typeof ALL_DAYS[number];

export default function ByDayPage() {
  const todayName = React.useMemo<DayName>(() => {
    const n = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date());
    return (ALL_DAYS.includes(n as DayName) ? n : "Monday") as DayName;
  }, []);

  const [selectedDay, setSelectedDay] = React.useState<DayName>(todayName);
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [oapNameById, setOapNameById] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const params: Record<string, any> = { page: 1, limit: 500 };
      const { data } = await api.get<{ programs: Program[] }>("/api/programs", { params, signal: controller.signal });
      const normalized = (data.programs || []).map((p: any) => ({ ...p, id: p.id ?? p._id })) as Program[];
      setPrograms(normalized);
    } catch (e) {
      if ((e as any)?.name !== "CanceledError" && (e as any)?.code !== "ERR_CANCELED") console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch programs and OAP names once
  React.useEffect(() => {
    fetchData();
    (async () => {
      try {
        const { data } = await api.get<{ oaps: OapItem[] }>("/api/oaps", { params: { page: 1, limit: 500 } });
        const map: Record<string, string> = {};
        (data.oaps || []).forEach((o: any) => {
          const oid = o.id ?? o._id;
          if (oid) map[oid] = o.oapName;
        });
        setOapNameById(map);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [fetchData]);

  const parseTime = (t?: string | null) => {
    if (!t) return null;
    const [h, m] = (t || "").split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const d = new Date(); d.setHours(h, m, 0, 0); return d;
  };

  const dayPrograms = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = programs.filter((p) => Array.isArray(p.days) && p.days.includes(selectedDay));
    const searched = term ? filtered.filter((p) => {
      const name = p.programName?.toLowerCase() || "";
      const details = p.programDetails?.toLowerCase() || "";
      return name.includes(term) || details.includes(term);
    }) : filtered;
    const withTimes = searched.map((p) => ({
      ...p,
      __start: parseTime(p.duration?.start),
      __end: parseTime(p.duration?.end),
    })).filter((x) => x.__start && x.__end).sort((a, b) => (a.__start as Date).getTime() - (b.__start as Date).getTime());
    return withTimes;
  }, [programs, search, selectedDay]);

  const nowInfo = React.useMemo(() => {
    const isToday = selectedDay === todayName;
    const now = new Date();
    let current: Program | null = null;
    let next: Program | null = null;
    for (let i = 0; i < dayPrograms.length; i += 1) {
      const p = dayPrograms[i] as any;
      if (isToday && now >= p.__start && now < p.__end) {
        current = p;
        next = (i + 1 < dayPrograms.length) ? (dayPrograms[i + 1] as any) : null;
        break;
      }
      if (isToday && p.__start > now) {
        next = p; break;
      }
    }
    return { current, next };
  }, [dayPrograms, selectedDay, todayName]);

  const renderOaps = (oaps?: Array<string | { id?: string; _id?: string }>) => {
    const labels = (oaps || []).map((x) => {
      if (typeof x === "string") return oapNameById[x] || x;
      const oid = (x as any)?.id ?? (x as any)?._id;
      return oid ? (oapNameById[oid] || oid) : "";
    }).filter(Boolean);
    const unique = Array.from(new Set(labels));
    return unique.length ? unique.join(", ") : "—";
  };

  const exportCsv = () => {
    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const headers = ["No.", "Program Name", "Start", "End", "OAPs", "Status", "Details"];
    const now = new Date();
    const lines = [headers]
      .concat(
        dayPrograms.map((p: any, i: number) => {
          const isCurrent = selectedDay === todayName && (now >= p.__start && now < p.__end);
          const status = isCurrent ? "On Air" : "Scheduled";
          return [
            i + 1,
            p.programName || "",
            p.duration?.start || "",
            p.duration?.end || "",
            renderOaps(p.oaps),
            status,
            p.programDetails || "",
          ];
        })
      )
      .map((row) => (row as any[]).map(escapeCsv).join(","))
      .join("\r\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `programs_${selectedDay}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Programs by Day</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">View your weekly program schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => fetchData()}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
              </svg>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Input
          placeholder="Search programs on this day..."
          value={search}
          onChange={(e) => {
            const v = e.target.value;
            setSearch(v);
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(() => {
              // purely client-side filter, no refetch needed
            }, 300);
          }}
        />
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {ALL_DAYS.map((d) => (
          <button
            key={d}
            type="button"
            className={
              "px-4 py-2.5 rounded-lg border-2 text-sm font-medium whitespace-nowrap transition-all duration-200 " +
              (selectedDay === d
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/50"
                : "border-neutral-300 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-neutral-50 dark:hover:bg-neutral-800")
            }
            onClick={() => setSelectedDay(d)}
            aria-pressed={selectedDay === d}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Now On Air & Up Next */}
      {selectedDay === todayName && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card gradient className="border-2 border-indigo-200 dark:border-indigo-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-neutral-500">Now Playing</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">LIVE</span>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {nowInfo.current ? nowInfo.current.programName : "—"}
            </div>
          </Card>
          <Card gradient className="border-2 border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="text-xs font-medium text-neutral-500">Up Next</div>
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {nowInfo.next ? `${nowInfo.next.programName} at ${((nowInfo.next as any).__start as Date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "—"}
            </div>
          </Card>
        </div>
      )}

      <Card gradient>
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading…</div>
        ) : dayPrograms.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No programs for {selectedDay}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-3 pr-3 w-12">No.</th>
                  <th className="py-3 pr-3">Program Name</th>
                  <th className="py-3 pr-3">Time</th>
                  <th className="py-3 pr-3">OAPs</th>
                  <th className="py-3 pr-0 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {dayPrograms.map((p: any, i: number) => {
                  const isCurrent = selectedDay === todayName && (() => { const n = new Date(); return n >= p.__start && n < p.__end; })();
                  return (
                    <tr key={p.id ?? i} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 pr-3 text-neutral-500">{i + 1}</td>
                      <td className="py-3 pr-3 font-medium">{p.programName}</td>
                      <td className="py-3 pr-3">{p.duration?.start} - {p.duration?.end}</td>
                      <td className="py-3 pr-3">{renderOaps(p.oaps)}</td>
                      <td className="py-3 pr-0 text-right">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/50">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            On Air
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            Scheduled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 