"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, User, X, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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
        if (username.trim().toLowerCase() === "isabel.cuchiaro") {
          try {
             await apiFetch("/api/auth/claim-legacy", { method: "POST" });
          } catch (e) {
             console.error("Não foi possível transferir os dados antigos", e);
          }
        }
        // Fechará sozinho pelo AuthProvider onAuthStateChange
      }
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-glass border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Decor */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isRegistering ? "Criar Nova Conta" : "Acesso Necessário"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {isRegistering ? "Escolha seu usuário e senha." : "Crie seu espaço ou entre para salvar seus estudos."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  required
                  placeholder="Seu usuário único"
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

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? "Confirmar e Criar Conta" : "Entrar")}
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
                variant="ghost"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  setSuccessMsg("");
                }}
                disabled={loading}
                className="w-full h-14 rounded-2xl hover:bg-white/5"
              >
                {isRegistering ? "Voltar para Login" : "Criar nova conta"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
