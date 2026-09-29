'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      <p className="text-xs text-slate-400 font-mono">Redirecting to Dashboard...</p>
    </div>
  );
}
