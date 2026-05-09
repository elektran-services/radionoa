"use client";

import React from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export type MediaItem = {
  id?: string;
  _id?: string;
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
};

export default function MediaPage() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const fetchMedia = React.useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ media: MediaItem[]; pagination: { page: number; pages: number } }>("/api/media", {
        params: { page: p, limit: 12 },
      });
      const normalized = (data.media || []).map((m) => ({ ...m, id: m.id ?? (m as any)._id }));
      setMedia(normalized);
      setPage(data.pagination?.page || 1);
      setPages(data.pagination?.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMedia(1);
  }, [fetchMedia]);

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      await api.post("/api/media/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchMedia(page);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Ensure you are signed in and file type/size is allowed.");
    } finally {
      setIsUploading(false);
      try { inputEl.value = ""; } catch {}
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/api/media/${id}`);
      await fetchMedia(page);
    } catch (e) {
      console.error(e);
      alert("Failed to delete media. Please try again.");
    }
  };

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">Media Library</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{"Upload and manage your station's media assets"}</p>
          </div>
          <label className="relative inline-flex items-center justify-center h-12 px-6 rounded-lg bg-gradient-to-r from-pink-500 to-orange-600 text-white hover:from-pink-600 hover:to-orange-700 cursor-pointer font-medium shadow-lg shadow-pink-500/50 transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-[0.98]">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={isUploading} />
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Image
              </>
            )}
          </label>
        </div>
      </div>

      <Card gradient>
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading media…</div>
        ) : media.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No media uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item, i) => (
              <div key={`media-${item.id ?? item.filename ?? i}`} className="group relative border-2 border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 hover:shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/proxy/${item.path.startsWith('/') ? item.path.slice(1) : item.path}`}
                    alt={item.originalname}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <Button 
                      variant="danger" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                      onClick={() => handleDelete(item.id)}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="text-xs font-medium truncate text-neutral-700 dark:text-neutral-300" title={item.originalname}>{item.originalname}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => fetchMedia(page - 1)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </Button>
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950 dark:to-orange-950 border border-pink-200 dark:border-pink-900">
            <span className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Page {page} of {pages}
            </span>
          </div>
          <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => fetchMedia(page + 1)}>
            Next
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
} 