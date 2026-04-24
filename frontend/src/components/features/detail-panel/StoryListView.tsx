import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCreateStory } from "@/services/storyApi";
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

interface StoryListViewProps {
  tree: InitiativeTree[];
  onSelect: (item: SelectedItem) => void;
}

export function StoryListView({ tree, onSelect }: StoryListViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const createStoryMutation = useCreateStory();

  const featureOptions = tree.flatMap((init) =>
    init.entities.flatMap((entity) =>
      entity.features.map((feature) => ({
        value: `${init.slug}/${entity.slug}/${feature.slug}`,
        label: `${init.name} / ${entity.name} / ${feature.title}`,
        initiativeSlug: init.slug,
        entitySlug: entity.slug,
        featureSlug: feature.slug,
      }))
    )
  );

  const stories = tree.flatMap((init) =>
    init.entities.flatMap((entity) =>
      entity.features.flatMap((feature) =>
        feature.stories.map((story) => ({
          ...story,
          initiativeSlug: init.slug,
          entitySlug: entity.slug,
          featureSlug: feature.slug,
          breadcrumb: `${init.name} / ${entity.name} / ${feature.title}`,
        }))
      )
    )
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !storyTitle.trim()) return;
    const option = featureOptions.find((o) => o.value === selectedFeature);
    if (!option) return;
    createStoryMutation.mutate(
      {
        initiativeSlug: option.initiativeSlug,
        entitySlug: option.entitySlug,
        featureSlug: option.featureSlug,
        data: {
          title: storyTitle.trim(),
          steps: [
            { keyword: "Given", text: "" },
            { keyword: "When", text: "" },
            { keyword: "Then", text: "" },
          ],
        },
      },
      {
        onSuccess: (story) => {
          setStoryTitle("");
          setSelectedFeature("");
          setShowForm(false);
          onSelect({
            type: "story",
            initiativeSlug: option.initiativeSlug,
            entitySlug: option.entitySlug,
            featureSlug: option.featureSlug,
            storyIndex: story.index,
          });
        },
      }
    );
  };

  if (stories.length === 0) {
    return <p className="text-sm text-muted">No stories yet. Create one from a feature in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Stories</h2>
          <p className="text-sm text-muted mt-1">{stories.length} stor{stories.length !== 1 ? "ies" : "y"}</p>
        </div>
        {!showForm && (
          <Button variant="accent" onClick={() => setShowForm(true)}>+ New Story</Button>
        )}
      </div>
      {showForm && (
        <div className="mb-6 rounded-2xl border border-dark/10 bg-bg-base p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoFocus
            >
              <option value="">Select feature...</option>
              {featureOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Story title..."
              className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit" disabled={createStoryMutation.isPending}>
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
        {stories.map((story) => (
          <div
            key={`${story.initiativeSlug}/${story.entitySlug}/${story.featureSlug}/${story.index}`}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dark/10 bg-bg-base cursor-pointer hover:border-accent/50 hover:shadow-sm transition-all text-sm"
            onClick={() =>
              onSelect({
                type: "story",
                initiativeSlug: story.initiativeSlug,
                entitySlug: story.entitySlug,
                featureSlug: story.featureSlug,
                storyIndex: story.index,
              })
            }
          >
            <span className="text-sm">📖</span>
            <span className="flex-1 font-medium text-dark">{story.title}</span>
            <span className={`rounded-xl px-3 py-1 text-xs font-medium ${STATUS_STYLES[story.status]}`}>
              {story.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-muted">{story.breadcrumb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
