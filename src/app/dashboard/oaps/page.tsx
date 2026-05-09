"use client";

import React from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export type OAP = {
  id?: string;
  _id?: string;
  oapName: string;
  programs?: string[];
  picture?: string;
  realName?: string;
  profile?: string;
};

type ProgramChoice = {
  id?: string;
  _id?: string;
  programName: string;
};

// Add media item type for dropdown options
type MediaItem = {
  id?: string;
  _id?: string;
  originalname: string;
  path: string;
};

export default function OAPsPage() {
  const [oaps, setOaps] = React.useState<OAP[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);
  const mountedOnceRef = React.useRef(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);


  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OAP | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = React.useState<string>("");


  const fetchOaps = React.useCallback(async (p = 1, q: string = "", retry = 0) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page: p, limit: 5 };
      const term = q.trim();
      if (term) params.search = term;
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const { data } = await api.get<{ oaps: OAP[]; pagination?: { page: number; pages: number } }>("/api/oaps", { params, signal: controller.signal });
      const normalized = (data.oaps || []).map((o: any) => {
        const oid = o.id ?? o._id;
        return { ...o, id: oid } as OAP;
      });
      setOaps(normalized);
      setPage(data.pagination?.page || 1);
      setPages(data.pagination?.pages || 1);
    } catch (e) {
      const status = (e as any)?.response?.status;
      if (status === 429 && retry < 1) {
        setTimeout(() => { fetchOaps(p, q, retry + 1); }, 1000);
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
    fetchOaps(1, search);
  }, [fetchOaps, search]);

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (oap: OAP) => {
    setEditing(oap);
    setOpen(true);
  };
  const onDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/api/oaps/${id}`);
      await fetchOaps(page, search);
    } catch (e) {
      console.error(e);
      alert("Failed to delete OAP. Please try again.");
    }
  };
  const applySearch = async () => {
    await fetchOaps(1, search);
  };
  const clearSearch = async () => {
    setSearch("");
    await fetchOaps(1, "");
  };

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">On-Air Personalities</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{"Manage your station's talent and presenters"}</p>
          </div>
          <Button size="lg" onClick={onCreate}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add OAP
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by OAP name or real name..."
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => {
                  fetchOaps(1, v);
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
        ) : oaps.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No OAPs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-3 pr-3 w-12">No.</th>
                  <th className="py-3 pr-3">OAP Name</th>
                  <th className="py-3 pr-3">Real Name</th>
                  <th className="py-3 pr-3">OAP Profile</th>
                  <th className="py-3 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {oaps.map((o, i) => (
                  <tr key={`oap-${o.id ?? (o as any)._id ?? i}`} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="py-3 pr-3 text-neutral-500">{(page - 1) * 5 + i + 1}</td>
                    <td className="py-3 pr-3 font-medium">{o.oapName}</td>
                    <td className="py-3 pr-3">{o.realName || "—"}</td>
                    <td className="py-3 pr-3">{o.profile || "—"}</td>
                    <td className="py-3 pr-0 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(o)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const id = o.id ?? (o as any)._id;
                            if (!id) return;
                            setConfirmDeleteId(id);
                            setConfirmDeleteName(o.oapName || "this OAP");
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
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => fetchOaps(page - 1, search)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </Button>
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-900">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Page {page} of {pages}
            </span>
          </div>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => fetchOaps(page + 1, search)}>
            Next
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
        </div>
      )}

      <OapModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        programs={[]} // Programs are no longer used in this modal
        onSaved={async () => { setOpen(false); await fetchOaps(page, search); }}
      />

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirm Delete">
        <div className="grid gap-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete <span className="font-semibold text-neutral-900 dark:text-neutral-100">{confirmDeleteName}</span>? This action cannot be undone.
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={async () => { const id = confirmDeleteId; setConfirmDeleteId(null); setConfirmDeleteName(""); if (id) { await onDelete(id); } }}>Delete OAP</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OapModal({ open, onClose, editing, programs, onSaved }: { open: boolean; onClose: () => void; editing: OAP | null; programs: ProgramChoice[]; onSaved: () => void }) {
  void programs;
  const [oapName, setOapName] = React.useState("");
  const [realName, setRealName] = React.useState("");
  const [profile, setProfile] = React.useState("");
  const [picture, setPicture] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  // Media dropdown state
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false);

  // Track initial values for diffing during edit
  const [initialName, setInitialName] = React.useState("");
  const [initialRealName, setInitialRealName] = React.useState("");
  const [initialProfile, setInitialProfile] = React.useState("");
  const [initialPicture, setInitialPicture] = React.useState<string>("");

  React.useEffect(() => {
    if (editing) {
      setOapName(editing.oapName || "");
      setRealName(editing.realName || "");
      setProfile(editing.profile || "");
      setPicture(editing.picture || "");
      // Initialize baselines for diff
      setInitialName(editing.oapName || "");
      setInitialRealName(editing.realName || "");
      setInitialProfile(editing.profile || "");
      setInitialPicture(editing.picture || "");
    } else {
      setOapName("");
      setRealName("");
      setProfile("");
      setPicture("");
      setInitialName("");
      setInitialRealName("");
      setInitialProfile("");
      setInitialPicture("");
    }
  }, [editing, open]);

  // Fetch media when modal opens
  const fetchMedia = React.useCallback(async () => {
    setIsLoadingMedia(true);
    try {
      const { data } = await api.get<{ media: MediaItem[]; pagination?: { page: number; pages: number } }>("/api/media", { params: { page: 1, limit: 100 } });
      const normalized = (data.media || []).map((m) => ({ ...m, id: m.id ?? (m as any)._id }));
      setMedia(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMedia(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  // Compute change flags for edit mode
  const trimmedName = oapName?.trim() || "";
  const trimmedRealName = realName?.trim() || "";
  const trimmedProfile = profile?.trim() || "";
  const nameChanged = editing ? trimmedName !== (initialName?.trim() || "") : false;
  const realNameChanged = editing ? trimmedRealName !== (initialRealName?.trim() || "") : false;
  const profileChanged = editing ? trimmedProfile !== (initialProfile?.trim() || "") : false;
  const pictureChanged = editing ? (picture || "") !== (initialPicture || "") : false;
  const anyChanges = editing ? (nameChanged || realNameChanged || profileChanged || pictureChanged) : true;

  const save = async () => {
    setIsSaving(true);
    try {
      if (editing) {
        const oid = editing.id ?? (editing as any)._id;
        if (!oid) throw new Error("Missing OAP id");
        const fullBody: Record<string, any> = {
          oapName: trimmedName,
          realName: trimmedRealName || undefined,
          profile: trimmedProfile || undefined,
        };
        if (pictureChanged && picture) fullBody.picture = picture; // include only when changed and set
        try {
          await api.put(`/api/oaps/${oid}`, fullBody);
        } catch (err) {
          const status = (err as any)?.response?.status;
          if (status === 400) {
            // Retry without new fields for backward compatibility
            const fallbackBody: Record<string, any> = {
              oapName: trimmedName,
            };
            if (pictureChanged && picture) fallbackBody.picture = picture;
            await api.put(`/api/oaps/${oid}`, fallbackBody);
          } else {
            throw err;
          }
        }
      } else {
        // Create requires name
        if (!trimmedName) {
          alert("OAP name is required");
          setIsSaving(false);
          return;
        }
        const fullBody: Record<string, any> = {
          oapName: trimmedName,
          realName: trimmedRealName || undefined,
          profile: trimmedProfile || undefined,
        };
        if (picture) fullBody.picture = picture;
        try {
          await api.post(`/api/oaps`, fullBody);
        } catch (err) {
          const status = (err as any)?.response?.status;
          if (status === 400) {
            // Retry without new fields for backward compatibility
            const fallbackBody: Record<string, any> = {
              oapName: trimmedName,
            };
            if (picture) fallbackBody.picture = picture;
            await api.post(`/api/oaps`, fallbackBody);
          } else {
            throw err;
          }
        }
      }
      await onSaved();
    } catch (e) {
      console.error("Failed to save OAP", e);
      const err = e as { response?: { data?: any; status?: number } };
      const detail = err?.response?.data;
      let message = "Failed to save OAP. Please check fields and try again.";
      if (detail?.message) message = detail.message;
      else if (Array.isArray(detail?.errors) && detail.errors.length > 0) message = detail.errors.map((x: any) => x.message || String(x)).join("\n");
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit OAP" : "Add OAP"}>
      <div className="grid gap-3">
        <Input label="OAP Name" value={oapName} onChange={(e) => setOapName(e.target.value)} />
        <Input label="Real Name" value={realName} onChange={(e) => setRealName(e.target.value)} />
        <div>
          <div className="text-sm font-medium mb-2">OAP Profile</div>
          <textarea
            className="w-full min-h-24 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Short bio or profile"
          />
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Picture</div>
          <select
            className="w-full h-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
          >
            <option value="">{isLoadingMedia ? "Loading media..." : "No picture"}</option>
            {/* Ensure the initial picture remains selectable even if not in the fetched list */}
            {initialPicture && !media.some((m) => (m.id ?? (m as any)._id) === initialPicture) && (
              <option value={initialPicture}>Current image</option>
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
          <Button onClick={save} loading={isSaving} disabled={isSaving || (editing ? !anyChanges : !trimmedName)}>{editing ? "Save Changes" : "Create OAP"}</Button>
        </div>
      </div>
    </Modal>
  );
} 