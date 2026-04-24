import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDeleteEntity } from "@/services/entityApi";
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

interface EntityDetailProps {
  initiativeSlug: string;
  entitySlug: string;
  tree: InitiativeTree[];
  onClearSelection: () => void;
  onSelect: (item: SelectedItem) => void;
}

export function EntityDetail({
  initiativeSlug,
  entitySlug,
  tree,
  onClearSelection,
  onSelect,
}: EntityDetailProps) {
  const [showForm, setShowForm] = useState(false);
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureEntry, setFeatureEntry] = useState("");
  const [featureUsecase, setFeatureUsecase] = useState("");
  const [featureInitiativeTag, setFeatureInitiativeTag] = useState("");
  const [featureIntegration, setFeatureIntegration] = useState("");
  const deleteMutation = useDeleteEntity();
  const createFeatureMutation = useCreateFeature();

  const handleDelete = () => {
    if (confirm(`Delete entity "${entitySlug}" and all its features?`)) {
      deleteMutation.mutate(
        { initiativeSlug, entitySlug },
        { onSuccess: onClearSelection }
      );
    }
  };

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim()) return;
    createFeatureMutation.mutate(
      {
        initiativeSlug,
        entitySlug,
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
          setShowForm(false);
          onSelect({
            type: "feature",
            initiativeSlug,
            entitySlug,
            featureSlug: feature.slug,
          });
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-6">
        <span className="inline-block rounded-lg bg-dark px-3 py-1 text-xs font-semibold text-white mb-3">
          Entity
        </span>
        <h2 className="text-2xl font-bold text-dark">
          {entitySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h2>
        <p className="text-sm text-muted mt-1">
          Part of {initiativeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
      </div>

      <div className="mb-6">
        {!showForm ? (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Feature</Button>
        ) : (
          <div className="rounded-2xl border border-dark/10 bg-bg-base p-4">
            <form onSubmit={handleCreateFeature} className="space-y-3">
              <input
                type="text"
                value={featureTitle}
                onChange={(e) => setFeatureTitle(e.target.value)}
                placeholder="Feature title..."
                className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
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
      </div>

      {(() => {
        const initiative = tree.find((i) => i.slug === initiativeSlug);
        const entity = initiative?.entities.find((e) => e.slug === entitySlug);
        const features = entity?.features ?? [];
        return (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
              Features ({features.length})
            </h3>
            {features.length === 0 ? (
              <p className="text-sm text-muted">No features yet.</p>
            ) : (
              <div className="space-y-2">
                {features.map((feature) => (
                  <div
                    key={feature.slug}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
                    onClick={() => onSelect({ type: "feature", initiativeSlug, entitySlug, featureSlug: feature.slug })}
                  >
                    <span className="text-sm">⚙️</span>
                    <span className="flex-1 font-medium text-dark">{feature.title}</span>
                    <span className={`rounded-xl px-3 py-1 text-xs font-medium ${STATUS_STYLES[feature.status]}`}>
                      {feature.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted">
                      {feature.story_count} stor{feature.story_count !== 1 ? "ies" : "y"}
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
          Delete Entity
        </Button>
      </div>
    </div>
  );
}
