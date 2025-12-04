"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop com glassmorphism */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal com glassmorphism */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[95vh] flex flex-col rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-gray-dark/90 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo com glassmorphism */}
        <div className="flex-shrink-0 border-b border-stroke/50 bg-white/50 backdrop-blur-sm px-6 py-4 dark:border-dark-3/50 dark:bg-dark-2/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-dark-5 transition hover:bg-gray-2/50 dark:text-dark-6 dark:hover:bg-dark-3/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content scrollável */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
