import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDeleteInitiative } from "@/services/initiativeApi";
import { useCreateEntity } from "@/services/entityApi";
import type { InitiativeTree } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

interface InitiativeDetailProps {
  initiativeSlug: string;
  tree: InitiativeTree[];
  onClearSelection: () => void;
  onSelect: (item: SelectedItem) => void;
}

export function InitiativeDetail({
  initiativeSlug,
  tree,
  onClearSelection,
  onSelect,
}: InitiativeDetailProps) {
  const [newEntityName, setNewEntityName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const deleteMutation = useDeleteInitiative();
  const createEntityMutation = useCreateEntity();

  const handleDelete = () => {
    if (confirm(`Delete initiative "${initiativeSlug}" and all its contents?`)) {
      deleteMutation.mutate(initiativeSlug, { onSuccess: onClearSelection });
    }
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    createEntityMutation.mutate(
      { initiativeSlug, data: { name: newEntityName.trim() } },
      {
        onSuccess: (entity) => {
          setNewEntityName("");
          setShowForm(false);
          onSelect({ type: "entity", initiativeSlug, entitySlug: entity.slug });
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-6">
        <span className="inline-block rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-dark mb-3">
          Initiative
        </span>
        <h2 className="text-2xl font-bold text-dark">
          {initiativeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h2>
      </div>

      <div className="mb-6">
        {!showForm ? (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Entity</Button>
        ) : (
          <div className="rounded-2xl border border-dark/10 bg-bg-base p-4">
            <form onSubmit={handleCreateEntity} className="flex gap-2">
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                placeholder="Entity name..."
                className="flex-1 rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
              <Button variant="primary" type="submit" disabled={createEntityMutation.isPending}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </form>
          </div>
        )}
      </div>

      {(() => {
        const initiative = tree.find((i) => i.slug === initiativeSlug);
        const entities = initiative?.entities ?? [];
        return (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Entities ({entities.length})
            </h3>
            {entities.length === 0 ? (
              <p className="text-sm text-muted">No entities yet.</p>
            ) : (
              <div className="space-y-2">
                {entities.map((entity) => (
                  <div
                    key={entity.slug}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
                    onClick={() => onSelect({ type: "entity", initiativeSlug, entitySlug: entity.slug })}
                  >
                    <span className="text-sm">👤</span>
                    <span className="flex-1 font-medium text-dark">{entity.name}</span>
                    <span className="text-xs text-muted">
                      {entity.feature_count} feature{entity.feature_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div className="border-t border-dark/10 pt-4">
        <Button variant="ghost" onClick={handleDelete} disabled={deleteMutation.isPending}>
          Delete Initiative
        </Button>
      </div>
    </div>
  );
}
