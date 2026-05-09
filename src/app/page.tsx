"use client";

import Link from "next/link";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950" />
      
      {/* Animated blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-5xl w-full text-center space-y-4 animate-fade-in">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Now On Air
          </h1>
          
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">
            Manage your FM station schedules, OAPs, and media with a beautiful, modern dashboard built for radio professionals.
          </p>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-2">
            <Link 
              className="group px-4 sm:px-5 h-8 sm:h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105" 
              href="/login"
            >
              Sign in
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link 
              className="px-4 sm:px-5 h-8 sm:h-9 inline-flex items-center justify-center rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm font-semibold text-xs sm:text-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-200 hover:scale-105 shadow-md" 
              href="/register"
            >
              Create account
            </Link>
          </div>

          {/* Features */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur-lg border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1 text-neutral-900 dark:text-neutral-100">Program Scheduling</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Schedule and manage radio programs with ease.</p>
            </div>

            <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur-lg border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1 text-neutral-900 dark:text-neutral-100">OAP Management</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Manage on-air personalities and assignments.</p>
            </div>

            <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-900/60 backdrop-blur-lg border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-600 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <h3 className="text-sm font-bold mb-1 text-neutral-900 dark:text-neutral-100">Media Library</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">Upload and organize media assets easily.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-3 sm:py-4 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Powered by <span className="font-bold text-neutral-900 dark:text-neutral-100">Elektran Integrated Services Limited</span>
            </p>
            <span className="text-neutral-400">•</span>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-500">
              © {currentYear}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

