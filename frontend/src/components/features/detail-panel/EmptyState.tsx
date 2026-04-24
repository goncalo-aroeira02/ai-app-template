export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 mb-4">
        <span className="text-3xl">📋</span>
      </div>
      <h3 className="text-lg font-semibold text-dark mb-2">Select an item</h3>
      <p className="text-sm text-muted max-w-xs">
        Choose an initiative, entity, feature, or story from the sidebar to view its details.
      </p>
    </div>
  );
}
