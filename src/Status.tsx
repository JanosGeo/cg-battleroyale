import { useState } from "react";

export enum Status {
  Remaining,
  Eliminated,
  New,
}

export function StatusComponent({
  alive,
  rowType,
  onClick,
}: {
  alive: boolean;
  rowType: Status;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const aliveSymbol = hovered ? "💣" : "💚";

  let deadSymbol = hovered ? "💊" : "💀";

  if (rowType === Status.New) {
    deadSymbol = hovered ? "🐣" : "🥚";
  }

  return (
    <span
      className="p-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {alive ? aliveSymbol : deadSymbol}
    </span>
  );
}
