import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ title, onClose, children, side }: { title: string; onClose: () => void; children: ReactNode; side?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("input,textarea,select,button[data-autofocus]")?.focus();
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className={`fixed inset-0 z-50 flex bg-black/50 ${side ? "justify-end" : "items-center justify-center p-3"}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title}
        className={`pop overflow-y-auto bg-surface shadow-2xl ${side ? "h-full w-full max-w-md border-l border-line" : "max-h-[92vh] w-full max-w-lg rounded-2xl border border-line"}`}>
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-ink" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5 pt-3">{children}</div>
      </div>
    </div>
  );
}
