import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateFeature } from "@/services/featureApi";
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
  const [showForm, setShowForm] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureEntry, setFeatureEntry] = useState("");
  const [featureUsecase, setFeatureUsecase] = useState("");
  const [featureInitiativeTag, setFeatureInitiativeTag] = useState("");
  const [featureIntegration, setFeatureIntegration] = useState("");
  const createFeatureMutation = useCreateFeature();

  const entityOptions = tree.flatMap((init) =>
    init.entities.map((entity) => ({
      value: `${init.slug}/${entity.slug}`,
      label: `${init.name} / ${entity.name}`,
      initiativeSlug: init.slug,
      entitySlug: entity.slug,
    }))
  );

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity || !featureTitle.trim()) return;
    const option = entityOptions.find((o) => o.value === selectedEntity);
    if (!option) return;
    createFeatureMutation.mutate(
      {
        initiativeSlug: option.initiativeSlug,
        entitySlug: option.entitySlug,
        data: {
          title: featureTitle.trim(),
          entry: featureEntry || undefined,
          usecase: featureUsecase || undefined,
          initiative_tag: featureInitiativeTag || undefined,
          integration: featureIntegration || undefined,
        },
      },
      {
        onSuccess: (feature) => {
          setFeatureTitle("");
          setFeatureEntry("");
          setFeatureUsecase("");
          setFeatureInitiativeTag("");
          setFeatureIntegration("");
          setSelectedEntity("");
          setShowForm(false);
          onSelect({
            type: "feature",
            initiativeSlug: option.initiativeSlug,
            entitySlug: option.entitySlug,
            featureSlug: feature.slug,
          });
        },
      }
    );
  };

  if (features.length === 0) {
    return <p className="text-sm text-muted">No features yet. Create one from an entity in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Features</h2>
          <p className="text-sm text-muted mt-1">{features.length} feature{features.length !== 1 ? "s" : ""}</p>
        </div>
        {!showForm && (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Feature</Button>
        )}
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-dark/10 bg-bg-base p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoFocus
            >
              <option value="">Select entity...</option>
              {entityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              placeholder="Feature title..."
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Entry Point</label>
                <input
                  type="text"
                  value={featureEntry}
                  onChange={(e) => setFeatureEntry(e.target.value)}
                  className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. bos.clients"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Use Case</label>
                <input
                  type="text"
                  value={featureUsecase}
                  onChange={(e) => setFeatureUsecase(e.target.value)}
                  className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. initiate-payment"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Initiative</label>
                <input
                  type="text"
                  value={featureInitiativeTag}
                  onChange={(e) => setFeatureInitiativeTag(e.target.value)}
                  className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. npp"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Integration</label>
                <input
                  type="text"
                  value={featureIntegration}
                  onChange={(e) => setFeatureIntegration(e.target.value)}
                  className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="e.g. asl"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" type="submit" disabled={createFeatureMutation.isPending}>
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
