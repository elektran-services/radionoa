"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import React from "react";
import api from "@/lib/api";

export default function DashboardHome() {
  const [counts, setCounts] = React.useState<{ programs: number; oaps: number; media: number }>({ programs: 0, oaps: 0, media: 0 });
  const [nowOnAir, setNowOnAir] = React.useState<string>("—");
  const [nowOnAirOap, setNowOnAirOap] = React.useState<string>("—");
  const [upNext, setUpNext] = React.useState<string>("—");
  const [upNextOap, setUpNextOap] = React.useState<string>("—");
  const [nowOnAirTime, setNowOnAirTime] = React.useState<string>("—");
  const [upNextTime, setUpNextTime] = React.useState<string>("—");
  const [todayPrograms, setTodayPrograms] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const [recentMedia, setRecentMedia] = React.useState<Array<{ id?: string; _id?: string; originalname: string; path: string }>>([]);

  React.useEffect(() => {
    // Update current time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const [progRes, oapRes, mediaRes, nowNextRes] = await Promise.all([
          api.get<{ programs: any[]; pagination?: { total?: number } }>("/api/programs", { params: { page: 1, limit: 500 } }),
          api.get<{ oaps: any[]; pagination?: { total?: number } }>("/api/oaps", { params: { page: 1, limit: 1 } }),
          api.get<{ media: any[]; pagination?: { total?: number } }>("/api/media", { params: { page: 1, limit: 6 } }),
          api.get<any>("/api/programs/now-and-next"),
        ]);
        const programs = progRes.data.programs || [];
        const oaps = oapRes.data.oaps || [];
        const media = mediaRes.data.media || [];
        const nowNextData = nowNextRes.data || {};
        const progTotal = progRes.data.pagination?.total ?? programs.length;
        const oapTotal = oapRes.data.pagination?.total ?? oaps.length;
        const mediaTotal = mediaRes.data.pagination?.total ?? media.length;
        setCounts({ programs: progTotal, oaps: oapTotal, media: mediaTotal });
        setRecentMedia(media.map((m) => ({ ...m, id: m.id ?? (m as any)._id })));

        console.log("Now and Next API Response:", nowNextData);

        // Use the now-and-next API for current program
        if (nowNextData.nowOnAir) {
          const currentProgram = nowNextData.nowOnAir;
          setNowOnAir(currentProgram.programName || "No Program");
          
          // Extract OAP names from the oaps array - join if multiple
          const oapNames = Array.isArray(currentProgram.oaps) && currentProgram.oaps.length > 0 
            ? currentProgram.oaps.join(", ") 
            : "—";
          setNowOnAirOap(oapNames);
          
          const startTime = currentProgram.duration?.start || "";
          const endTime = currentProgram.duration?.end || "";
          setNowOnAirTime(startTime && endTime ? `${startTime} - ${endTime}` : "—");
        } else {
          setNowOnAir("No Program");
          setNowOnAirOap("—");
          setNowOnAirTime("—");
        }

        if (nowNextData.upNext) {
          const nextProgram = nowNextData.upNext;
          setUpNext(nextProgram.programName || "No Program Scheduled");
          
          // Extract OAP names for next program
          const nextOapNames = Array.isArray(nextProgram.oaps) && nextProgram.oaps.length > 0 
            ? nextProgram.oaps.join(", ") 
            : "—";
          setUpNextOap(nextOapNames);
          
          setUpNextTime(nextProgram.duration?.start || "—");
        } else {
          setUpNext("No Program Scheduled");
          setUpNextOap("—");
          setUpNextTime("—");
        }

        // Compute Today's Programs count
        const today = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date());
        const todays = programs.filter((p: any) => Array.isArray(p.days) && p.days.includes(today));
        setTodayPrograms(todays.length);
        
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-500/20">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
        <Card className="px-6 py-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Current Time</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent tabular-nums">
            {currentTime}
          </div>
        </Card>
      </div>

      {/* Now On Air - Sophisticated Hero */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Live Broadcast Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-neutral-900 dark:via-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-100 dark:border-blue-900/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-600/30 rounded-2xl blur-lg animate-pulse" />
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-xl">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 animate-pulse opacity-50" />
                    <svg className="relative h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="12" cy="12" r="2" className="animate-ping" opacity="0.75" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/40 mb-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
                    BROADCASTING LIVE
                  </div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{nowOnAirTime}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Now Playing</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {nowOnAir}
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Presented by</div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{nowOnAirOap}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">Coming Up Next</div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{upNext}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">with {upNextOap}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">at {upNextTime}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-white border-0 shadow-2xl shadow-slate-600/30">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold opacity-90 mb-1">{"Today's Schedule"}</div>
                <div className="text-4xl font-bold">{todayPrograms}</div>
                <div className="text-sm opacity-80">Programs lined up</div>
              </div>
              <Link href="/dashboard/by-day">
                <button className="w-full py-3 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-200 font-semibold flex items-center justify-center gap-2 border border-white/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  View Full Schedule
                </button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">Quick Actions</div>
            <Link href="/dashboard/programs">
              <button className="w-full py-3 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 font-semibold text-sm flex items-center justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-700 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Program
                </span>
                <svg className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </Link>
            <Link href="/dashboard/oaps">
              <button className="w-full py-3 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 font-semibold text-sm flex items-center justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-700 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  Manage OAPs
                </span>
                <svg className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </Link>
            <Link href="/dashboard/media">
              <button className="w-full py-3 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-200 font-semibold text-sm flex items-center justify-between group">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-700 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Media Library
                </span>
                <svg className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Stats Overview - Refined */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/programs" className="block group">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/10 to-slate-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-600/20 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5">Programs</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.programs || 0}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Manage schedules →</div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/oaps" className="block group">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-blue-200 dark:border-blue-900">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5">On-Air Talent</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.oaps || 0}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">View team →</div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/media" className="block group">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-teal-200 dark:border-teal-900">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-teal-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:scale-110 transition-transform">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5">Media Assets</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.media || 0}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Browse library →</div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Media - Enhanced */}
      <Card className="bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Recent Media</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">Latest uploads to your library</p>
          </div>
          <Link href="/dashboard/media">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-semibold">
              View All
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </Link>
        </div>
          {recentMedia.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center shadow-xl shadow-pink-500/30">
                <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No Media Files</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">Upload images to start building your media library</p>
              <Link href="/dashboard/media">
                <Button>Upload Your First File</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentMedia.map((m, i) => (
              <Link key={`media-${m.id ?? i}`} href="/dashboard/media" className="block group">
                <div className="relative aspect-square rounded-xl border-2 border-neutral-200 dark:border-neutral-800 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/proxy/${m.path.startsWith('/') ? m.path.slice(1) : m.path}`}
                    alt={m.originalname}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-20 truncate">
                    {m.originalname}
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}
        </Card>
    </div>
  );
} 