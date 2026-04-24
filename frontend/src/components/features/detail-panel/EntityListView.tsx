import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateEntity } from "@/services/entityApi";
import type { InitiativeTree } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

interface EntityListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function EntityListView({ tree, onSelect }: EntityListViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState("");
  const [entityName, setEntityName] = useState("");
  const createEntityMutation = useCreateEntity();

  const entities = tree.flatMap((init) =>
    init.entities.map((entity) => ({
      ...entity,
      initiativeSlug: init.slug,
      initiativeName: init.name,
    }))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitiative || !entityName.trim()) return;
    createEntityMutation.mutate(
      { initiativeSlug: selectedInitiative, data: { name: entityName.trim() } },
      {
        onSuccess: (entity) => {
          setEntityName("");
          setSelectedInitiative("");
          setShowForm(false);
          onSelect({ type: "entity", initiativeSlug: selectedInitiative, entitySlug: entity.slug });
        },
      }
    );
  };

  if (entities.length === 0) {
    return <p className="text-sm text-muted">No entities yet. Create one from an initiative in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Entities</h2>
          <p className="text-sm text-muted mt-1">{entities.length} entit{entities.length !== 1 ? "ies" : "y"}</p>
        </div>
        {!showForm && (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Entity</Button>
        )}
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-dark/10 bg-bg-base p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <select
              value={selectedInitiative}
              onChange={(e) => setSelectedInitiative(e.target.value)}
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoFocus
            >
              <option value="">Select initiative...</option>
              {tree.map((init) => (
                <option key={init.slug} value={init.slug}>{init.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Entity name..."
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit" disabled={createEntityMutation.isPending}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-2">
        {entities.map((entity) => (
          <div
            key={`${entity.initiativeSlug}/${entity.slug}`}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
            onClick={() =>
              onSelect({
                type: "entity",
                initiativeSlug: entity.initiativeSlug,
                entitySlug: entity.slug,
              })
            }
          >
            <span className="text-sm">👤</span>
            <span className="flex-1 font-medium text-dark">{entity.name}</span>
            <span className="text-xs text-muted mr-2">{entity.initiativeName}</span>
            <span className="text-xs text-muted">
              {entity.feature_count} feature{entity.feature_count !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
