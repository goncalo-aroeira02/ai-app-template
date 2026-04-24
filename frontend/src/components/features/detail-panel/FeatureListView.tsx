import type { InitiativeTree, Status } from "@/types";
import type { SelectedItem } from "@/pages/ManagerPage";

const STATUS_STYLES: Record<Status, string> = {
  draft: "bg-dark/10 text-dark",
  active: "bg-accent text-dark",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
  completed: "bg-green-200 text-green-900",
  archived: "bg-dark/5 text-muted",
};

interface FeatureListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function FeatureListView({ tree, onSelect }: FeatureListViewProps) {
  const features = tree.flatMap((init) =>
    init.entities.flatMap((entity) =>
      entity.features.map((feature) => ({
        ...feature,
        initiativeSlug: init.slug,
        entitySlug: entity.slug,
        breadcrumb: `${init.name} / ${entity.name}`,
      }))
    )
  );

  if (features.length === 0) {
    return <p className="text-sm text-muted">No features yet. Create one from an entity in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark">Features</h2>
        <p className="text-sm text-muted mt-1">{features.length} feature{features.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={`${feature.initiativeSlug}/${feature.entitySlug}/${feature.slug}`}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
            onClick={() =>
              onSelect({
                type: "feature",
                initiativeSlug: feature.initiativeSlug,
                entitySlug: feature.entitySlug,
                featureSlug: feature.slug,
              })
            }
          >
            <span className="text-sm">⚙️</span>
            <span className="flex-1 font-medium text-dark">{feature.title}</span>
            <span className={`rounded-xl px-3 py-1 text-xs font-medium ${STATUS_STYLES[feature.status]}`}>
              {feature.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-muted mr-2">{feature.breadcrumb}</span>
            <span className="text-xs text-muted">
              {feature.story_count} stor{feature.story_count !== 1 ? "ies" : "y"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
