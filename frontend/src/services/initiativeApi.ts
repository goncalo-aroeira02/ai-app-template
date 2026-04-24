import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import type { Initiative, InitiativeCreate, InitiativeTree } from "@/types";

// ── Fetch functions ─────────────────────────────────────────────────

export function getInitiatives(): Promise<Initiative[]> {
  return apiFetch<Initiative[]>("/api/v1/initiatives/");
}

export function createInitiative(data: InitiativeCreate): Promise<Initiative> {
  return apiFetch<Initiative>("/api/v1/initiatives/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteInitiative(slug: string): Promise<void> {
  return apiFetch<void>(`/api/v1/initiatives/${slug}`, { method: "DELETE" });
}

export function getInitiativeTree(): Promise<InitiativeTree[]> {
  return apiFetch<InitiativeTree[]>("/api/v1/initiatives/tree");
}

// ── React Query hooks ───────────────────────────────────────────────

export function useInitiatives() {
  return useQuery({ queryKey: ["initiatives"], queryFn: getInitiatives });
}

export function useInitiativeTree() {
  return useQuery({ queryKey: ["initiatives", "tree"], queryFn: getInitiativeTree });
}

export function useCreateInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInitiative,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["initiatives"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}

export function useDeleteInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteInitiative,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["initiatives"] });
      qc.invalidateQueries({ queryKey: ["initiatives", "tree"] });
    },
  });
}
