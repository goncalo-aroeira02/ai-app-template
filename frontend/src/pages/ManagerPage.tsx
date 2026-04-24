import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SidebarTree } from "@/components/features/sidebar/SidebarTree";
import { DetailPanel } from "@/components/features/detail-panel/DetailPanel";
import { useCreateInitiative, useInitiativeTree } from "@/services/initiativeApi";
import { cn } from "@/lib/utils";

export interface SelectedItem {
  type: "initiative" | "entity" | "feature" | "story";
  initiativeSlug: string;
  entitySlug?: string;
  featureSlug?: string;
  storyIndex?: number;
}

export type ActiveTab = "initiatives" | "entities" | "features" | "stories";

const TABS: { key: ActiveTab; label: string }[] = [
  { key: "initiatives", label: "Initiatives" },
  { key: "entities", label: "Entities" },
  { key: "features", label: "Features" },
  { key: "stories", label: "Stories" },
];

export function ManagerPage() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null);
  const [showInitForm, setShowInitForm] = useState(false);
  const [initName, setInitName] = useState("");
  const createMutation = useCreateInitiative();
  const { data: tree } = useInitiativeTree();

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedItem(null);
  };

  const handleSelect = (item: SelectedItem) => {
    setSelectedItem(item);
    setActiveTab(null);
  };

  const handleCreateInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initName.trim()) return;
    createMutation.mutate(
      { name: initName.trim() },
      {
        onSuccess: (initiative) => {
          setInitName("");
          setShowInitForm(false);
          handleSelect({ type: "initiative", initiativeSlug: initiative.slug });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="border-b border-dark/10 bg-bg-surface">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <span className="text-lg font-bold text-dark">E</span>
            </div>
            <h1 className="text-xl font-bold text-dark">Ebury Gherkin Portal</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            {TABS.map((tab) => (
              <span
                key={tab.key}
                className={cn(
                  "cursor-pointer transition-colors hover:text-dark",
                  activeTab === tab.key && "text-dark font-medium"
                )}
                onClick={() => handleTabClick(tab.key)}
              >
                {tab.label}
              </span>
            ))}
          </nav>
          <Button variant="accent" onClick={() => setShowInitForm(true)}>
            + New Initiative
          </Button>
        </div>
      </header>

      {/* Create Initiative Banner */}
      {showInitForm && (
        <div className="mx-6 mt-6">
          <div className="rounded-3xl bg-accent border border-dark p-6 shadow-[0px_4px_0px_0px_#191a23]">
            <form onSubmit={handleCreateInitiative} className="flex gap-3 items-center">
              <input
                type="text"
                value={initName}
                onChange={(e) => setInitName(e.target.value)}
                placeholder="Initiative name..."
                className="flex-1 rounded-xl border border-dark/30 bg-white px-4 py-3 text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-dark/20"
                autoFocus
              />
              <Button variant="primary" type="submit" disabled={createMutation.isPending}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowInitForm(false)}>
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Sidebar */}
        <aside className="w-80 shrink-0">
          <div className="rounded-3xl border border-dark/10 bg-bg-surface p-4 shadow-sm">
            <h2 className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Explorer
            </h2>
            <SidebarTree selectedItem={selectedItem} onSelect={handleSelect} />
          </div>
        </aside>

        {/* Detail Panel */}
        <main className="flex-1">
          <div className="rounded-3xl border border-dark/10 bg-bg-surface p-8 shadow-sm min-h-[calc(100vh-12rem)]">
            <DetailPanel
              selectedItem={selectedItem}
              activeTab={activeTab}
              tree={tree ?? []}
              onClearSelection={() => { setSelectedItem(null); setActiveTab(null); }}
              onSelect={handleSelect}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
