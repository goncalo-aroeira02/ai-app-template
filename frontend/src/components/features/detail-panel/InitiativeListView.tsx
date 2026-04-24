import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateInitiative } from "@/services/initiativeApi";
import type { InitiativeTree } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

interface InitiativeListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function InitiativeListView({ tree, onSelect }: InitiativeListViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [initName, setInitName] = useState("");
  const createMutation = useCreateInitiative();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initName.trim()) return;
    createMutation.mutate(
      { name: initName.trim() },
      {
        onSuccess: (initiative) => {
          setInitName("");
          setShowForm(false);
          onSelect({ type: "initiative", initiativeSlug: initiative.slug });
        },
      }
    );
  };

  if (tree.length === 0) {
    return <p className="text-sm text-muted">No initiatives yet. Create one to get started.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Initiatives</h2>
          <p className="text-sm text-muted mt-1">{tree.length} initiative{tree.length !== 1 ? "s" : ""}</p>
        </div>
        {!showForm && (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Initiative</Button>
        )}
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-dark/10 bg-bg-base p-4">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={initName}
              onChange={(e) => setInitName(e.target.value)}
              placeholder="Initiative name..."
              className="flex-1 rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoFocus
            />
            <Button variant="primary" type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </form>
        </div>
      )}
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
