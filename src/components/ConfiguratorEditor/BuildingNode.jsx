export default function BuildingNode({ data }) {
  const { name, onClick } = data;

  return (
    <div
      className="bg-background-secondary border-2 border-accent rounded-lg p-4 min-w-[200px] min-h-[100px] cursor-pointer relative"
      onClick={onClick}
    >
      <div className="font-semibold text-sm mb-1">
        {name}
      </div>
      <div className="text-xs text-foreground-secondary">
        Gebäude
      </div>
      {/* Gebäude hat keine Ein-/Ausgänge - ist nur Info-Container */}
    </div>
  );
}
