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

  if (stories.length === 0) {
    return <p className="text-sm text-muted">No stories yet. Create one from a feature in the sidebar.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark">Stories</h2>
        <p className="text-sm text-muted mt-1">{stories.length} stor{stories.length !== 1 ? "ies" : "y"}</p>
      </div>
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
