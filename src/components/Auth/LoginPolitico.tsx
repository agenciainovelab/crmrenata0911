"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPolitico() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha: password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      const userData = await response.json();

      // Salvar estado de autenticação
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", userData.id);
      localStorage.setItem("userEmail", userData.email);

      // Redirecionar para dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo/logo-politico.png"
            alt="Logo Renata Daguiar"
            width={300}
            height={80}
            className="h-auto w-auto max-w-[300px]"
          />
        </div>

        {/* Card de Login */}
        <div className="rounded-2xl bg-white p-8 shadow-card-2 dark:bg-gray-dark md:p-12">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-dark dark:text-white">
              Acesse o Sistema Político
            </h1>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {loading ? (
            // Skeleton Loader
            <div className="space-y-6">
              <div className="h-14 animate-pulse rounded-lg bg-gray-3 dark:bg-dark-3"></div>
              <div className="h-14 animate-pulse rounded-lg bg-gray-3 dark:bg-dark-3"></div>
              <div className="h-12 animate-pulse rounded-lg bg-gray-3 dark:bg-dark-3"></div>
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-primary">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="font-medium">Autenticando...</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label className="mb-2.5 block font-medium text-dark dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-12 pr-4 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="h-5 w-5 text-dark-5 dark:text-dark-6" />
                  </span>
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="mb-2.5 block font-medium text-dark dark:text-white">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-stroke bg-transparent py-3.5 pl-12 pr-4 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="h-5 w-5 text-dark-5 dark:text-dark-6" />
                  </span>
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-medium text-white transition hover:bg-opacity-90"
              >
                <LogIn className="h-5 w-5" />
                Entrar
              </button>

              {/* Link Esqueci Senha */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-dark-5 dark:text-dark-6">
          Campanha Inteligente © 2025
        </div>
      </div>
    </div>
  );
}
