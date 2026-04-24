import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TreeViewProps {
  label: string;
  icon?: string;
  children?: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
  isLeaf?: boolean;
}

export function TreeView({
  label,
  icon,
  children,
  isExpanded = false,
  onToggle,
  isSelected = false,
  onClick,
  isLeaf = false,
}: TreeViewProps) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm hover:bg-zinc-800",
          isSelected && "bg-zinc-800 text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!isLeaf && onToggle) onToggle();
          if (onClick) onClick();
        }}
      >
        {!isLeaf && (
          <span className="w-4 text-xs text-zinc-500 select-none">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {isLeaf && <span className="w-4" />}
        {icon && <span className="text-xs">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      {isExpanded && children && (
        <div className="ml-3 border-l border-zinc-800">{children}</div>
      )}
    </div>
  );
}
