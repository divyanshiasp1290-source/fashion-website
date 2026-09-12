import { Trash2, X } from "lucide-react";
import React from "react";

export type DeleteConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
};

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this record? This action cannot be undone.",
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6 space-y-5 text-ink animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-ink transition p-1 cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="space-y-1.5 min-w-0 pr-4">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
              Studio Action Required
            </span>
            <h3 className="font-display text-lg uppercase font-bold text-ink">
              {title}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="font-bold text-ink bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-[11px] truncate mt-1">
                {itemName}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold uppercase text-xs transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>{isLoading ? "Deleting..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
