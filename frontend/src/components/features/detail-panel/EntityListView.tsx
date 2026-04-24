import type { InitiativeTree } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

interface EntityListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function EntityListView({ tree, onSelect }: EntityListViewProps) {
  const entities = tree.flatMap((init) =>
    init.entities.map((entity) => ({
      ...entity,
      initiativeSlug: init.slug,
      initiativeName: init.name,
    }))
  );

  if (entities.length === 0) {
    return <p className="text-sm text-muted">No entities yet. Create one from an initiative in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark">Entities</h2>
        <p className="text-sm text-muted mt-1">{entities.length} entit{entities.length !== 1 ? "ies" : "y"}</p>
      </div>
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
