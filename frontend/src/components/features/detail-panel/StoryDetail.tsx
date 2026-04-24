import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFeature } from "@/services/featureApi";
import { useUpdateStory, useDeleteStory } from "@/services/storyApi";
import type { GherkinStep, Status } from "@/types";

const STATUSES: Status[] = ["draft", "active", "in_progress", "done", "completed", "archived"];
const KEYWORDS = ["Given", "When", "Then", "And", "But"] as const;

const KEYWORD_STYLES: Record<string, string> = {
  Given: "text-blue-600 bg-blue-50",
  When: "text-amber-600 bg-amber-50",
  Then: "text-green-600 bg-green-50",
  And: "text-dark/60 bg-dark/5",
  But: "text-red-600 bg-red-50",
};

interface StoryDetailProps {
  initiativeSlug: string;
  entitySlug: string;
  featureSlug: string;
  storyIndex: number;
  onClearSelection: () => void;
}

export function StoryDetail({
  initiativeSlug,
  entitySlug,
  featureSlug,
  storyIndex,
  onClearSelection,
}: StoryDetailProps) {
  const { data: feature, isLoading } = useFeature(initiativeSlug, entitySlug, featureSlug);
  const updateMutation = useUpdateStory();
  const deleteMutation = useDeleteStory();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<Status>("draft");
  const [editSteps, setEditSteps] = useState<GherkinStep[]>([]);

  if (isLoading || !feature) {
    return <p className="text-muted">Loading...</p>;
  }

  const story = feature.stories[storyIndex];
  if (!story) {
    return <p className="text-red-500">Story not found</p>;
  }

  const startEdit = () => {
    setEditTitle(story.title);
    setEditStatus(story.status);
    setEditSteps([...story.steps]);
    setEditing(true);
  };

  const saveEdit = () => {
    updateMutation.mutate(
      {
        initiativeSlug,
        entitySlug,
        featureSlug,
        storyIndex,
        data: { title: editTitle, status: editStatus, steps: editSteps },
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    if (confirm(`Delete story "${story.title}"?`)) {
      deleteMutation.mutate(
        { initiativeSlug, entitySlug, featureSlug, storyIndex },
        { onSuccess: onClearSelection }
      );
    }
  };

  const updateStep = (idx: number, field: keyof GherkinStep, value: string) => {
    setEditSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const addStep = () => {
    setEditSteps((prev) => [...prev, { keyword: "And", text: "" }]);
  };

  const removeStep = (idx: number) => {
    setEditSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-dark">Edit Story</h2>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
          placeholder="Story title"
        />
        <select
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value as Status)}
          className="rounded-xl border border-dark/20 bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-dark">Steps</h3>
          {editSteps.map((step, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={step.keyword}
                onChange={(e) => updateStep(idx, "keyword", e.target.value)}
                className="rounded-xl border border-dark/20 bg-white px-3 py-2 text-sm text-dark w-28 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {KEYWORDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <input
                type="text"
                value={step.text}
                onChange={(e) => updateStep(idx, "text", e.target.value)}
                className="flex-1 rounded-xl border border-dark/20 bg-white px-3 py-2 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="step description..."
              />
              <button
                onClick={() => removeStep(idx)}
                className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <Button variant="ghost" onClick={addStep}>+ Add Step</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="accent" onClick={saveEdit} disabled={updateMutation.isPending}>Save</Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="inline-block rounded-lg bg-dark px-3 py-1 text-xs font-semibold text-accent mb-3">
            Scenario
          </span>
          <h2 className="text-2xl font-bold text-dark">{story.title}</h2>
        </div>
        <span className="rounded-xl bg-dark/10 px-3 py-1 text-xs font-medium text-dark">
          {story.status.replace(/_/g, " ")}
        </span>
      </div>
      <p className="text-sm text-muted mb-6">
        Scenario #{storyIndex} in {featureSlug}
      </p>

      <div className="space-y-2 mb-8">
        {story.steps.map((step, idx) => (
          <div key={idx} className="flex gap-3 items-center text-sm">
            <span className={`rounded-lg px-3 py-1 font-mono text-xs font-medium w-20 text-center ${KEYWORD_STYLES[step.keyword] || "bg-dark/5 text-dark"}`}>
              {step.keyword}
            </span>
            <span className="text-dark">{step.text}</span>
          </div>
        ))}
        {story.steps.length === 0 && (
          <p className="text-muted text-sm">No steps defined</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={startEdit}>Edit</Button>
        <Button variant="ghost" onClick={handleDelete} disabled={deleteMutation.isPending}>
          Delete
        </Button>
      </div>
    </div>
  );
}
