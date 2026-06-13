"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

type Message = {
  role: "user" | "tutor";
  content: string;
};

export function AITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "tutor", content: "Olá! Sou o Lumenos AI. Como posso ajudar com seus estudos hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiFetch<{ message: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      setMessages((prev) => [...prev, { role: "tutor", content: response.message }]);
    } catch (error) {
      console.error("Failed to fetch AI response", error);
      setMessages((prev) => [...prev, { role: "tutor", content: "Desculpe, tive um problema de conexão. Tente novamente!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-accent to-purple-500 border-none group"
            >
              <MessageSquare className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-glass shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                  <Bot className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold leading-none tracking-tight text-white">Lumenos AI</h3>
                  <p className="text-xs text-muted-foreground mt-1">Tutor Inteligente</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/10">
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary/20" : "bg-white/10"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-accent-foreground" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-white/5 border border-white/10 text-foreground rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="rounded-2xl px-4 py-2 bg-white/5 border border-white/10 text-muted-foreground rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Pensando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Faça uma pergunta..."
                  className="bg-white/5 border-white/10 focus-visible:ring-accent rounded-full pr-12"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 h-8 w-8 rounded-full bg-accent hover:bg-accent/80 text-white transition-colors"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
