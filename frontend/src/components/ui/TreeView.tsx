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
          "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors hover:bg-dark/5",
          isSelected && "bg-accent/20 text-dark font-medium"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!isLeaf && onToggle) onToggle();
          if (onClick) onClick();
        }}
      >
        {!isLeaf && (
          <span className={cn("w-4 text-xs text-muted select-none transition-transform", isExpanded && "rotate-90")}>
            ▶
          </span>
        )}
        {isLeaf && <span className="w-4" />}
        {icon && <span className="text-sm">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      {isExpanded && children && (
        <div className="ml-4 border-l-2 border-accent/30 pl-1">{children}</div>
      )}
    </div>
  );
}
