"use client";

import Protected from "@/components/Protected";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import React from "react";
import Modal from "@/components/ui/Modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const station = useAuthStore((s) => s.station);
	const logout = useAuthStore((s) => s.logout);
	const [collapsed, setCollapsed] = React.useState(false);
	const [confirmLogoutOpen, setConfirmLogoutOpen] = React.useState(false);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const menuContainerRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (!menuOpen) return;
			const container = menuContainerRef.current;
			if (container && !container.contains(e.target as Node)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, [menuOpen]);

	const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [
		{
			href: "/dashboard",
			label: "Overview",
			icon: (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<path d="M3 12l9-9 9 9" />
					<path d="M9 21V9h6v12" />
				</svg>
			),
		},
		{
			href: "/dashboard/programs",
			label: "Programs",
			icon: (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
			),
		},
		{
			href: "/dashboard/oaps",
			label: "OAPs",
			icon: (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M23 21v-2a4 4 0 00-3-3.87" />
					<path d="M16 3.13a4 4 0 010 7.75" />
				</svg>
			),
		},
		{
			href: "/dashboard/media",
			label: "Media",
			icon: (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<path d="M21 15l-5-5L5 21" />
				</svg>
			),
		},
		{
			href: "/dashboard/by-day",
			label: "Programs by Day",
			icon: (
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
					<path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
				</svg>
			),
		},
	];

	return (
		<Protected>
			<div className={`min-h-screen grid ${collapsed ? "grid-cols-[72px_1fr]" : "grid-cols-[260px_1fr]"} transition-all duration-300`}>
				<aside className="hidden md:block border-r border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 p-4 space-y-4">
					<div className="mb-2">
						<div className="min-h-[48px]">
							{collapsed ? (
								<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-lg font-bold text-white shadow-lg" title={station?.stationName || "Station"}>
									{(station?.stationName || "S").slice(0, 1)}
								</div>
							) : (
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-sm font-bold text-white shadow-md">
											{(station?.stationName || "S").slice(0, 1)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-base font-bold truncate max-w-[160px] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" title={station?.stationName}>{station?.stationName}</div>
											<div className="text-xs text-neutral-500 truncate max-w-[160px]" title={station?.frequency}>{station?.frequency}</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
					<nav className="grid gap-1 text-sm">
						{navItems.map((item) => (
							<div key={item.href} className="relative group">
								<Link
									className={`px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 flex items-center gap-3 transition-all duration-200 hover:shadow-sm ${collapsed ? "justify-center" : "justify-start"}`}
									href={item.href}
									title={item.label}
									aria-label={item.label}
								>
									<span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>
									{!collapsed && <span className="truncate font-medium">{item.label}</span>}
								</Link>
								{collapsed && (
									<div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg transition-opacity z-50">
										{item.label}
									</div>
								)}
							</div>
						))}
					</nav>
				</aside>
				<div className="grid grid-rows-[64px_1fr] min-h-screen">
					<header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 bg-white dark:bg-neutral-900 shadow-sm">
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<Button className="hidden md:inline-flex" variant="ghost" size="sm" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((v) => !v)}>
								<svg className={"h-5 w-5 transition-transform " + (collapsed ? "" : "-rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<polyline points="15 18 9 12 15 6" />
								</svg>
							</Button>
							<span className="font-bold text-lg md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{station?.stationName}</span>
							{collapsed && <span className="hidden md:inline font-bold text-lg truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{station?.stationName}</span>}
						</div>
						<div className="flex items-center gap-3 shrink-0">
							<span className="hidden md:inline text-sm text-neutral-500 truncate max-w-[40vw]">{station?.email}</span>
							<div className="relative" ref={menuContainerRef}>
								<Button variant="ghost" size="sm" aria-label="Settings" onClick={() => setMenuOpen((v) => !v)}>
									<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<circle cx="12" cy="12" r="3" />
										<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 007.6 19.6a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09A1.65 1.65 0 003.6 7.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09A1.65 1.65 0 0016.4 4.4a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
									</svg>
								</Button>
								{menuOpen && (
									<div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-2 z-50 animate-fade-in">
										<Button variant="ghost" className="w-full justify-start" onClick={() => { setMenuOpen(false); setConfirmLogoutOpen(true); }}>
											<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
												<polyline points="16 17 21 12 16 7" />
												<line x1="21" y1="12" x2="9" y2="12" />
											</svg>
											Logout
										</Button>
									</div>
								)}
							</div>
						</div>
					</header>
					<main className="p-4 md:p-8 bg-gradient-to-br from-neutral-50 via-indigo-50/30 to-purple-50/30 dark:from-neutral-950 dark:via-indigo-950/30 dark:to-purple-950/30 overflow-y-auto">
						<div className="animate-fade-in">
							{children}
						</div>
					</main>
				</div>
				<Modal open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)} title="Confirm Logout">
					<div className="grid gap-4">
						<div className="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to log out?</div>
						<div className="flex items-center justify-end gap-3">
							<Button variant="ghost" onClick={() => setConfirmLogoutOpen(false)}>Cancel</Button>
							<Button variant="danger" onClick={() => { setConfirmLogoutOpen(false); logout(); }}>Logout</Button>
						</div>
					</div>
				</Modal>
			</div>
		</Protected>
	);
} 