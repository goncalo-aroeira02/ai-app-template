import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import type { Story, StoryCreate, StoryUpdate } from "@/types";

export function createStory(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string,
  data: StoryCreate
): Promise<Story> {
  return apiFetch<Story>(
    `/api/v1/features/${initiativeSlug}/${entitySlug}/${featureSlug}/stories/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export function updateStory(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string,
  storyIndex: number,
  data: StoryUpdate
): Promise<Story> {
  return apiFetch<Story>(
    `/api/v1/stories/${initiativeSlug}/${entitySlug}/${featureSlug}/${storyIndex}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export function deleteStory(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string,
  storyIndex: number
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/stories/${initiativeSlug}/${entitySlug}/${featureSlug}/${storyIndex}`,
    { method: "DELETE" }
  );
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      initiativeSlug,
      entitySlug,
      featureSlug,
      data,
    }: {
      initiativeSlug: string;
      entitySlug: string;
      featureSlug: string;
      data: StoryCreate;
    }) => createStory(initiativeSlug, entitySlug, featureSlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useUpdateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      initiativeSlug,
      entitySlug,
      featureSlug,
      storyIndex,
      data,
    }: {
      initiativeSlug: string;
      entitySlug: string;
      featureSlug: string;
      storyIndex: number;
      data: StoryUpdate;
    }) => updateStory(initiativeSlug, entitySlug, featureSlug, storyIndex, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      initiativeSlug,
      entitySlug,
      featureSlug,
      storyIndex,
    }: {
      initiativeSlug: string;
      entitySlug: string;
      featureSlug: string;
      storyIndex: number;
    }) => deleteStory(initiativeSlug, entitySlug, featureSlug, storyIndex),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}
