import { useInitiativeTree } from "@/services/initiativeApi";
import { InitiativeNode } from "./InitiativeNode";
import type { SelectedItem } from "@/pages/ManagerPage";

interface SidebarTreeProps {
  selectedItem: SelectedItem | null;
  onSelect: (item: SelectedItem) => void;
}

export function SidebarTree({ selectedItem, onSelect }: SidebarTreeProps) {
  const { data: tree, isLoading, error } = useInitiativeTree();

  if (isLoading) {
    return <p className="px-3 py-4 text-sm text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="px-3 py-4 text-sm text-red-500">Failed to load tree</p>;
  }

  if (!tree || tree.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-muted">
        No initiatives yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="py-2">
      {tree.map((initiative) => (
        <InitiativeNode
          key={initiative.slug}
          initiative={initiative}
          selectedItem={selectedItem}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
