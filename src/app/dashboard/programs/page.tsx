"use client";

import React from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export type Program = {
  id?: string;
  _id?: string;
  programName: string;
  days: string[];
  duration?: {
    start: string;
    end: string;
  };
  oaps?: string[];
  thumbnail?: string;
  programDetails?: string;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [, setUseClientPagination] = React.useState(false);
  const [, setAllPrograms] = React.useState<Program[] | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const mountedOnceRef = React.useRef(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Program | null>(null);
  const [oapNameById, setOapNameById] = React.useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = React.useState<string>("");

  const fetchPrograms = React.useCallback(async (p = 1, q: string = "", retry = 0) => {
    setIsLoading(true);
    try {
      const LIMIT = 5;
      const params: Record<string, any> = { page: p, limit: LIMIT };
      const term = q.trim();
      if (term) {
        // Ask server for more items when searching to enable client fallback if needed
        params.page = 1;
        params.limit = 500;
        params.search = term;
      }
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const { data } = await api.get<{ programs: Program[]; pagination?: { page: number; pages: number } }>("/api/programs", { params, signal: controller.signal });
      const normalized = (data.programs || []).map((o: any) => {
        const pid = o.id ?? o._id;
        return { ...o, id: pid } as Program;
      });
      if (term) {
        // Client-side filter and paginate
        const lower = term.toLowerCase();
        const filtered = normalized.filter((prg) => {
          const name = prg.programName?.toLowerCase() || "";
          const details = prg.programDetails?.toLowerCase() || "";
          const daysText = (prg.days || []).join(",").toLowerCase();
          return name.includes(lower) || details.includes(lower) || daysText.includes(lower);
        });
        setUseClientPagination(true);
        setAllPrograms(filtered);
        const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
        const currentPage = Math.min(Math.max(1, p), totalPages);
        setPage(currentPage);
        setPages(totalPages);
        const start = (currentPage - 1) * LIMIT;
        setPrograms(filtered.slice(start, start + LIMIT));
      } else if (typeof data.pagination?.pages === "number" && typeof data.pagination?.page === "number") {
        // Server-side pagination
        setUseClientPagination(false);
        setAllPrograms(null);
        setPrograms(normalized);
        setPage(data.pagination.page || 1);
        setPages(data.pagination.pages || 1);
      } else {
        // Fallback single page or client paginate if too many returned
        if (normalized.length > LIMIT) {
          setUseClientPagination(true);
          setAllPrograms(normalized);
          const totalPages = Math.ceil(normalized.length / LIMIT);
          const currentPage = Math.min(Math.max(1, p), totalPages);
          setPage(currentPage);
          setPages(totalPages);
          const start = (currentPage - 1) * LIMIT;
          setPrograms(normalized.slice(start, start + LIMIT));
        } else {
          setUseClientPagination(false);
          setAllPrograms(null);
          setPrograms(normalized);
          setPage(1);
          setPages(1);
        }
      }
    } catch (e) {
      const status = (e as any)?.response?.status;
      if (status === 429 && retry < 1) {
        setTimeout(() => { fetchPrograms(p, q, retry + 1); }, 1000);
      } else if ((e as any)?.name !== "CanceledError" && (e as any)?.code !== "ERR_CANCELED") {
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (mountedOnceRef.current) return;
    mountedOnceRef.current = true;
    fetchPrograms(1, search);
  }, [fetchPrograms, search]);

  // Fetch OAP names once for display mapping in list
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ oaps: Array<{ id?: string; _id?: string; oapName: string }> }>("/api/oaps", { params: { page: 1, limit: 500 } });
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
  }, []);

  // Fetch OAP names once for display mapping in list
  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (program: Program) => {
    setEditing(program);
    setOpen(true);
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/api/programs/${id}`);
      await fetchPrograms(page, search);
    } catch (e) {
      console.error(e);
      alert("Failed to delete program. Please try again.");
    }
  };

  const applySearch = async () => {
    await fetchPrograms(1, search);
  };

  const clearSearch = async () => {
    setSearch("");
    await fetchPrograms(1, "");
  };

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Radio Programs</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{"Manage your station's program schedule"}</p>
          </div>
          <Button size="lg" onClick={onCreate}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Program
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search programs by name, details, or days..."
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => {
                  fetchPrograms(1, v);
                }, 400);
              }}
              onKeyDown={async (e) => { if (e.key === "Enter") await applySearch(); }}
            />
          </div>
          <Button variant="secondary" onClick={applySearch}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </Button>
          {search && (
            <Button variant="ghost" onClick={clearSearch}>Clear</Button>
          )}
        </div>
      </div>

      <Card gradient>
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading…</div>
        ) : programs.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No programs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-3 pr-3 w-12">No.</th>
                  <th className="py-3 pr-3">Program Name</th>
                  <th className="py-3 pr-3">Time</th>
                  <th className="py-3 pr-3">Days</th>
                  <th className="py-3 pr-3">OAPs</th>
                  <th className="py-3 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program, i) => (
                  <tr key={program.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="py-3 pr-3 text-neutral-500">{(page - 1) * 5 + i + 1}</td>
                    <td className="py-3 pr-3 font-medium">{program.programName}</td>
                    <td className="py-3 pr-3">{program.duration?.start} - {program.duration?.end}</td>
                    <td className="py-3 pr-3">{program.days?.join(", ")}</td>
                    <td className="py-3 pr-3">{(() => {
                      const labels = (program.oaps || []).map((x: any) => {
                        if (typeof x === "string") return oapNameById[x] || x;
                        const oid = x?.id ?? x?._id;
                        return oid ? (oapNameById[oid] || oid) : "";
                      }).filter(Boolean);
                      const unique = Array.from(new Set(labels));
                      return unique.length ? unique.join(", ") : "—";
                    })()}</td>
                    <td className="py-3 pr-0 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(program)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const id = program.id ?? (program as any)._id;
                            if (!id) return;
                            setConfirmDeleteId(id);
                            setConfirmDeleteName(program.programName || "this program");
                          }}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => fetchPrograms(page - 1, search)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </Button>
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-900">
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Page {page} of {pages}
            </span>
          </div>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => fetchPrograms(page + 1, search)}>
            Next
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
        </div>
      )}

      <ProgramModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        onSaved={async () => { setOpen(false); await fetchPrograms(page, search); }}
      />

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirm Delete">
        <div className="grid gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete <span className="font-semibold text-neutral-900 dark:text-neutral-100">{confirmDeleteName}</span>? This action cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={async () => { const id = confirmDeleteId; setConfirmDeleteId(null); setConfirmDeleteName(""); if (id) { await onDelete(id); } }}>Delete Program</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProgramModal({ open, onClose, editing, onSaved }: { open: boolean; onClose: () => void; editing: Program | null; onSaved: () => void }) {
  const [programName, setProgramName] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [programDetails, setProgramDetails] = React.useState("");
  const [days, setDays] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  // OAP selection state
  type OapChoice = { id?: string; _id?: string; oapName: string };
  const [oapOptions, setOapOptions] = React.useState<OapChoice[]>([]);
  const [selectedOaps, setSelectedOaps] = React.useState<string[]>([]);
  const [oapQuery, setOapQuery] = React.useState("");
  const [oapsLoading, setOapsLoading] = React.useState(false);
  const [oapNameById, setOapNameById] = React.useState<Record<string, string>>({});
  const [attempted, setAttempted] = React.useState(false);
  // Media dropdown state for program thumbnail
  type MediaItem = { id?: string; _id?: string; originalname: string; path: string };
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false);
  const [thumbnail, setThumbnail] = React.useState("");
  const [initialThumbnail, setInitialThumbnail] = React.useState("");

  React.useEffect(() => {
    if (editing) {
      setProgramName(editing.programName || "");
      setStart(editing.duration?.start || "");
      setEnd(editing.duration?.end || "");
      setProgramDetails(editing.programDetails || "");
      setDays(editing.days || []);
      const normalized = (editing.oaps || []).map((x: any) => {
        if (typeof x === "string") return x;
        if (x?.id) return x.id as string;
        if (x?._id) return x._id as string;
        return String(x);
      });
      setSelectedOaps(Array.from(new Set(normalized)));
      setThumbnail(editing.thumbnail || "");
      setInitialThumbnail(editing.thumbnail || "");
    } else {
      setProgramName("");
      setStart("");
      setEnd("");
      setProgramDetails("");
      setDays([]);
      setSelectedOaps([]);
      setThumbnail("");
      setInitialThumbnail("");
    }
    setAttempted(false);
  }, [editing, open]);

  // fetch OAPs when modal opens or query changes
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setOapsLoading(true);
      try {
        const { data } = await api.get<{ oaps: OapChoice[] }>("/api/oaps", { params: { page: 1, limit: 200, search: oapQuery || undefined } });
        if (cancelled) return;
        const normalized = (data.oaps || []).map((o) => ({ ...o, id: o.id ?? (o as any)._id }));
        setOapOptions(normalized);
        // merge into id->name map
        setOapNameById((prev) => {
          const next = { ...prev };
          normalized.forEach((o) => {
            const oid = (o.id ?? (o as any)._id) as string | undefined;
            if (oid) next[oid] = o.oapName;
          });
          return next;
        });
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setOapsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, oapQuery]);

  // fetch media when modal opens
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setIsLoadingMedia(true);
      try {
        const { data } = await api.get<{ media: MediaItem[] }>("/api/media", { params: { page: 1, limit: 200 } });
        if (cancelled) return;
        const normalized = (data.media || []).map((m) => ({ ...m, id: m.id ?? (m as any)._id }));
        setMedia(normalized);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setIsLoadingMedia(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const onChangeOaps: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const id = e.currentTarget.value;
    const checked = e.currentTarget.checked;
    setSelectedOaps((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((x) => x !== id);
    });
  };

  const selectAllVisible = () => {
    const ids = oapOptions.map((o) => (o.id ?? (o as any)._id)).filter(Boolean) as string[];
    setSelectedOaps((prev) => Array.from(new Set([...prev, ...ids])));
  };
  const clearSelected = () => setSelectedOaps([]);
  const removeSelected = (id: string) => setSelectedOaps((prev) => prev.filter((x) => x !== id));

  const HHMM = /^\d{2}:\d{2}$/;
  const validName = programName.trim().length > 0;
  const validStart = HHMM.test(start);
  const validEnd = HHMM.test(end);
  const canSave = validName && validStart && validEnd && !isSaving;

  const save = async () => {
    setAttempted(true);
    if (!canSave) return;
    setIsSaving(true);
    try {
      const body: any = {
        programName,
        duration: { start, end },
        programDetails,
        days,
      };
      if (selectedOaps.length > 0) body.oaps = selectedOaps;
      if (thumbnail) body.thumbnail = thumbnail;
      if (editing) {
        const pid = editing.id ?? (editing as any)._id;
        if (!pid) throw new Error("Missing program id");
        await api.put(`/api/programs/${pid}`, body);
      } else {
        await api.post(`/api/programs`, body);
      }
      await onSaved();
    } catch (e) {
      console.error(e);
      alert("Failed to save program. Please check fields and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Program" : "Add Program"}>
      <div className="grid gap-3">
        <Input label="Program Name *" value={programName} onChange={(e) => setProgramName(e.target.value)} error={attempted && !validName ? "Program name is required" : undefined} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Start (HH:MM) *" placeholder="06:00" value={start} onChange={(e) => setStart(e.target.value)} error={attempted && !validStart ? "Format HH:MM" : undefined} />
          <Input label="End (HH:MM) *" placeholder="09:00" value={end} onChange={(e) => setEnd(e.target.value)} error={attempted && !validEnd ? "Format HH:MM" : undefined} />
        </div>
        <Input label="Details" value={programDetails} onChange={(e) => setProgramDetails(e.target.value)} />
        <div>
          <div className="text-sm font-medium mb-2">Days</div>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                className={"px-3 h-9 rounded-md border " + (days.includes(d) ? "bg-black text-white border-black" : "border-neutral-300 dark:border-neutral-700")}
                onClick={() => toggleDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">OAPs</div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Input className="w-48 sm:w-64" placeholder="Search OAPs" value={oapQuery} onChange={(e) => setOapQuery(e.target.value)} />
            <Button variant="secondary" onClick={selectAllVisible} disabled={oapsLoading || oapOptions.length === 0}>Select All</Button>
            <Button variant="ghost" onClick={clearSelected} disabled={selectedOaps.length === 0}>Clear</Button>
            <span className="text-xs text-neutral-500">{selectedOaps.length} selected</span>
          </div>
          {selectedOaps.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedOaps.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800">
                  <span className="max-w-[10rem] truncate" title={oapNameById[id] || id}>{oapNameById[id] || id}</span>
                  <button type="button" className="opacity-70 hover:opacity-100" onClick={() => removeSelected(id)}>✕</button>
                </span>
              ))}
            </div>
          )}
          {oapsLoading ? (
            <div className="p-3 text-sm text-neutral-500">Loading OAPs…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-auto pr-1">
              {oapOptions.map((o) => {
                const oid = o.id ?? (o as any)._id;
                if (!oid) return null;
                const checked = selectedOaps.includes(oid);
                return (
                  <label key={oid} className="flex items-center gap-2 p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      value={oid}
                      checked={checked}
                      onChange={onChangeOaps}
                    />
                    <span className="truncate">{o.oapName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Program Image</div>
          <select
            className="w-full h-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          >
            <option value="">{isLoadingMedia ? "Loading media..." : "No image"}</option>
            {initialThumbnail && !media.some((m) => (m.id ?? (m as any)._id) === initialThumbnail) && (
              <option value={initialThumbnail}>Current image</option>
            )}
            {media.map((m) => {
              const mid = m.id ?? (m as any)._id;
              if (!mid) return null;
              return (
                <option key={mid} value={mid}>{m.originalname}</option>
              );
            })}
          </select>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={isSaving} disabled={!canSave}>{editing ? "Save Changes" : "Create Program"}</Button>
        </div>
      </div>
    </Modal>
  );
} 