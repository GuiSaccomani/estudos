import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://vrzojjohmajzxjjitugt.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyem9qam9obWFqenhqaml0dWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDg3NjksImV4cCI6MjA5NjkyNDc2OX0.iCT0RnF3UB2a97Xh1ZTLa-Aq7Z9bcHpFJHVXoOOkbX4";
const supabase = createClient(supabaseUrl, supabaseKey);

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Se não tiver token, mas for GET, permite como visitante
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (req.method === "GET") {
        req.user = null;
        return next();
      }
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (req.method === "GET") {
        req.user = null;
        return next();
      }
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
};

export const getAuthFilter = (user: any): any => {
  if (!user) {
    // Para visitantes, retorna um ID impossível para não vazar dados
    return { userId: "GUEST_NO_ACCESS" };
  }
  // Se for o admin, não aplica filtro de userId (vê tudo)
  if (user.email === "admin@lumenos.app") {
    return {};
  }
  // Se for usuário normal, filtra apenas os próprios dados
  return { userId: user.id };
};
