"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Modo drawer (desliza desde abajo, ideal para móvil) */
  drawer?: boolean;
  className?: string;
  /** Impide cerrar con click fuera o ESC */
  preventClose?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  drawer = false,
  className,
  preventClose = false,
}: DialogProps) {
  const close = React.useCallback(() => {
    if (!preventClose) onOpenChange(false);
  }, [preventClose, onOpenChange]);

  // Cerrar con tecla ESC
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Bloquear scroll del fondo
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative z-10 w-full border border-white/10 bg-[#0d0d10]/95 shadow-2xl",
              "backdrop-blur-2xl",
              drawer
                ? "max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl sm:max-w-lg"
                : "rounded-t-3xl sm:rounded-3xl sm:max-w-lg max-h-[92dvh] overflow-y-auto",
              className
            )}
            initial={
              drawer
                ? { y: "100%", scale: 0.98, opacity: 0.6 }
                : { y: 24, scale: 0.96, opacity: 0 }
            }
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={
              drawer
                ? { y: "100%", scale: 0.98, opacity: 0.4 }
                : { y: 24, scale: 0.96, opacity: 0 }
            }
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {!preventClose && (
              <button
                onClick={close}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.12] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Contenedor con padding estándar dentro del Dialog */
export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
