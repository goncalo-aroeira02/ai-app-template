import { EmptyState } from "./EmptyState";
import { InitiativeDetail } from "./InitiativeDetail";
import { EntityDetail } from "./EntityDetail";
import { FeatureDetail } from "./FeatureDetail";
import { StoryDetail } from "./StoryDetail";
import { InitiativeListView } from "./InitiativeListView";
import { EntityListView } from "./EntityListView";
import { FeatureListView } from "./FeatureListView";
import { StoryListView } from "./StoryListView";
import type { SelectedItem, ActiveTab } from "@/pages/ManagerPage";
import type { InitiativeTree } from "@/types";

interface DetailPanelProps {
  selectedItem: SelectedItem | null;
  activeTab: ActiveTab | null;
  tree: InitiativeTree[];
  onClearSelection: () => void;
  onSelect: (item: SelectedItem) => void;
}

export function DetailPanel({ selectedItem, activeTab, tree, onClearSelection, onSelect }: DetailPanelProps) {
  if (activeTab) {
    switch (activeTab) {
      case "initiatives":
        return <InitiativeListView tree={tree} onSelect={onSelect} />;
      case "entities":
        return <EntityListView tree={tree} onSelect={onSelect} />;
      case "features":
        return <FeatureListView tree={tree} onSelect={onSelect} />;
      case "stories":
        return <StoryListView tree={tree} onSelect={onSelect} />;
    }
  }

  if (!selectedItem) {
    return <EmptyState />;
  }

  switch (selectedItem.type) {
    case "initiative":
      return (
        <InitiativeDetail
          initiativeSlug={selectedItem.initiativeSlug}
          tree={tree}
          onClearSelection={onClearSelection}
          onSelect={onSelect}
        />
      );
    case "entity":
      return (
        <EntityDetail
          initiativeSlug={selectedItem.initiativeSlug}
          entitySlug={selectedItem.entitySlug!}
          tree={tree}
          onClearSelection={onClearSelection}
          onSelect={onSelect}
        />
      );
    case "feature":
      return (
        <FeatureDetail
          initiativeSlug={selectedItem.initiativeSlug}
          entitySlug={selectedItem.entitySlug!}
          featureSlug={selectedItem.featureSlug!}
          onClearSelection={onClearSelection}
          onSelect={onSelect}
        />
      );
    case "story":
      return (
        <StoryDetail
          initiativeSlug={selectedItem.initiativeSlug}
          entitySlug={selectedItem.entitySlug!}
          featureSlug={selectedItem.featureSlug!}
          storyIndex={selectedItem.storyIndex!}
          onClearSelection={onClearSelection}
        />
      );
  }
}
