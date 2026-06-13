"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const getEmail = (userStr: string) => {
    const clean = userStr.trim();
    return clean.includes("@") ? clean : `${clean}@lumenos.app`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const email = getEmail(username);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("Usuário ou senha incorretos.");
      }

      if (data.session) {
        if (username.trim().toLowerCase().includes("isabel.cuchiaro")) {
          try {
             await apiFetch("/api/auth/claim-legacy", { method: "POST" });
          } catch (e) {
             console.error("Não foi possível transferir os dados antigos", e);
          }
        }
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const email = getEmail(username);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error("Não foi possível criar a conta. " + error.message);
      }

      setSuccessMsg("Conta criada com sucesso! Faça login abaixo.");
      setIsRegistering(false); // Volta pro modo de login
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen min-h-screen w-full flex bg-background">
      {/* Esquerda - Imagem / Branding */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          {/* Imagem Premium de Estudos / Filosofia usando Unsplash */}
          {/* Use Image from next/image or disable lint for this specific img if it's an external url. Since it's a local or static img, we will just disable the warning to match the design quickly */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1973&auto=format&fit=crop" 
            alt="Estudante focada" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
              A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original.
            </h1>
            <p className="text-xl text-zinc-400 font-light">
              Albert Einstein
            </p>
          </motion.div>
        </div>
      </div>

      {/* Direita - Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isRegistering ? "Criar Nova Conta" : "Lumenos"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {isRegistering ? "Escolha seu usuário e senha." : "Entre no seu universo particular de estudos."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  required
                  placeholder="Usuário ou Email"
                  className="pl-12 h-14 bg-card border-border rounded-2xl focus-visible:ring-accent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="pl-12 pr-12 h-14 bg-card border-border rounded-2xl focus-visible:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-red-400 bg-red-400/10 p-3 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            {successMsg && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-green-400 bg-green-400/10 p-3 rounded-xl"
              >
                {successMsg}
              </motion.p>
            )}

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? "Confirmar e Criar Conta" : "Acessar Conta")}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">
                  {isRegistering ? "Já tem conta?" : "Novo por aqui?"}
                </span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button
                type="button"
                variant="soft"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  setSuccessMsg("");
                }}
                disabled={loading}
                className="w-full h-14 rounded-2xl font-medium"
              >
                {isRegistering ? "Voltar para Login" : "Criar seu espaço"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
