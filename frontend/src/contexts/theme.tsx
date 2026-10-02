import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "system" | "light" | "dark";
const Ctx = createContext<{ theme: Theme; cycle: () => void } | null>(null);
const read = (): Theme => { try { const t = localStorage.getItem("myday.theme"); return t === "light" || t === "dark" ? t : "system"; } catch { return "system"; } };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(read);
  useEffect(() => {
    const el = document.documentElement;
    if (theme === "system") el.removeAttribute("data-theme"); else el.dataset.theme = theme;
    try { if (theme === "system") localStorage.removeItem("myday.theme"); else localStorage.setItem("myday.theme", theme); } catch { /* ignore */ }
  }, [theme]);
  const cycle = () => setTheme((t) => (t === "system" ? "light" : t === "light" ? "dark" : "system"));
  return <Ctx.Provider value={{ theme, cycle }}>{children}</Ctx.Provider>;
}
export function useTheme() { const c = useContext(Ctx); if (!c) throw new Error("useTheme outside ThemeProvider"); return c; }
