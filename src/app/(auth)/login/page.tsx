"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
      router.replace("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950" />
      
      {/* Animated blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Home Button */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-lg transition-all duration-200 font-semibold text-sm text-neutral-700 dark:text-neutral-300 group">
          <svg className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>
      </Link>
      
      <Card className="w-full max-w-md relative animate-fade-in shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-neutral-900/90">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Sign in to your account to continue</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" placeholder="••••••••" {...register("password")} error={errors.password?.message} />
          <Button className="w-full" type="submit" loading={isLoading}>Sign in</Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" href="/register">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
} 