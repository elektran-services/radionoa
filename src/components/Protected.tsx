"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((s) => s.token);
  const station = useAuthStore((s) => s.station);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadProfile = useAuthStore((s) => s.loadProfile);
  const triedProfile = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!station && !isLoading && !triedProfile.current) {
      triedProfile.current = true;
      loadProfile();
    }
  }, [mounted, token, station, isLoading, loadProfile, router]);

  if (!mounted) return null;
  if (!token) return null;

  if (!station && isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-neutral-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!station && !isLoading) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <div className="text-lg font-semibold mb-2">Unable to load your profile</div>
          <div className="text-sm text-neutral-500">Please sign in again.</div>
          <button
            className="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-md border border-neutral-300 dark:border-neutral-700"
            onClick={() => router.replace("/login")}
          >
            Go to Sign in
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 