"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se está autenticado
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    
    if (isAuthenticated === "true") {
      router.push("/dashboard");
    } else {
      router.push("/auth/sign-in");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
