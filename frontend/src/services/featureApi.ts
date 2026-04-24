import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import type { Feature, FeatureBrief, FeatureCreate, FeatureUpdate } from "@/types";

export function getFeatures(
  initiativeSlug: string,
  entitySlug: string
): Promise<FeatureBrief[]> {
  return apiFetch<FeatureBrief[]>(
    `/api/v1/initiatives/${initiativeSlug}/entities/${entitySlug}/features/`
  );
}

export function getFeature(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string
): Promise<Feature> {
  return apiFetch<Feature>(
    `/api/v1/features/${initiativeSlug}/${entitySlug}/${featureSlug}`
  );
}

export function createFeature(
  initiativeSlug: string,
  entitySlug: string,
  data: FeatureCreate
): Promise<Feature> {
  return apiFetch<Feature>(
    `/api/v1/initiatives/${initiativeSlug}/entities/${entitySlug}/features/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export function updateFeature(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string,
  data: FeatureUpdate
): Promise<Feature> {
  return apiFetch<Feature>(
    `/api/v1/features/${initiativeSlug}/${entitySlug}/${featureSlug}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export function deleteFeature(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/features/${initiativeSlug}/${entitySlug}/${featureSlug}`,
    { method: "DELETE" }
  );
}

export function useFeatures(initiativeSlug: string, entitySlug: string) {
  return useQuery({
    queryKey: ["features", initiativeSlug, entitySlug],
    queryFn: () => getFeatures(initiativeSlug, entitySlug),
    enabled: !!initiativeSlug && !!entitySlug,
  });
}

export function useFeature(
  initiativeSlug: string,
  entitySlug: string,
  featureSlug: string
) {
  return useQuery({
    queryKey: ["features", initiativeSlug, entitySlug, featureSlug],
    queryFn: () => getFeature(initiativeSlug, entitySlug, featureSlug),
    enabled: !!initiativeSlug && !!entitySlug && !!featureSlug,
  });
}

export function useCreateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      initiativeSlug,
      entitySlug,
      data,
    }: {
      initiativeSlug: string;
      entitySlug: string;
      data: FeatureCreate;
    }) => createFeature(initiativeSlug, entitySlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useUpdateFeature() {
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
      data: FeatureUpdate;
    }) => updateFeature(initiativeSlug, entitySlug, featureSlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useDeleteFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      initiativeSlug,
      entitySlug,
      featureSlug,
    }: {
      initiativeSlug: string;
      entitySlug: string;
      featureSlug: string;
    }) => deleteFeature(initiativeSlug, entitySlug, featureSlug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}
