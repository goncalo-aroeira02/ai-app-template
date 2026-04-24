import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import type { Entity, EntityCreate } from "@/types";

export function getEntities(initiativeSlug: string): Promise<Entity[]> {
  return apiFetch<Entity[]>(`/api/v1/initiatives/${initiativeSlug}/entities/`);
}

export function createEntity(
  initiativeSlug: string,
  data: EntityCreate
): Promise<Entity> {
  return apiFetch<Entity>(
    `/api/v1/initiatives/${initiativeSlug}/entities/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export function deleteEntity(
  initiativeSlug: string,
  entitySlug: string
): Promise<void> {
  return apiFetch<void>(
    `/api/v1/initiatives/${initiativeSlug}/entities/${entitySlug}`,
    { method: "DELETE" }
  );
}

export function useEntities(initiativeSlug: string) {
  return useQuery({
    queryKey: ["entities", initiativeSlug],
    queryFn: () => getEntities(initiativeSlug),
    enabled: !!initiativeSlug,
  });
}

export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ initiativeSlug, data }: { initiativeSlug: string; data: EntityCreate }) =>
      createEntity(initiativeSlug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ initiativeSlug, entitySlug }: { initiativeSlug: string; entitySlug: string }) =>
      deleteEntity(initiativeSlug, entitySlug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entities"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}
