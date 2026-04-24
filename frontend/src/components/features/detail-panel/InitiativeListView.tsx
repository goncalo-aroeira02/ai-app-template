import type { InitiativeTree } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

interface InitiativeListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function InitiativeListView({ tree, onSelect }: InitiativeListViewProps) {
  if (tree.length === 0) {
    return <p className="text-sm text-muted">No initiatives yet. Create one to get started.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark">Initiatives</h2>
        <p className="text-sm text-muted mt-1">{tree.length} initiative{tree.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-2">
        {tree.map((initiative) => (
          <div
            key={initiative.slug}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
            onClick={() => onSelect({ type: "initiative", initiativeSlug: initiative.slug })}
          >
            <span className="text-sm">🚀</span>
            <span className="flex-1 font-medium text-dark">{initiative.name}</span>
            <span className="text-xs text-muted">
              {initiative.entity_count} entit{initiative.entity_count !== 1 ? "ies" : "y"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
