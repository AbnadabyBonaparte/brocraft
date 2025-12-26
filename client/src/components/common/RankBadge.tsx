import { cn } from "@/lib/utils";

const RANK_COLORS: Record<string, string> = {
  NOVATO: "from-gray-400 to-gray-600",
  BRO_DA_PANELA: "from-orange-400 to-orange-600",
  MESTRE_DO_MALTE: "from-yellow-400 to-yellow-600",
  ALQUIMISTA: "from-purple-400 to-purple-600",
  LEGEND: "from-red-500 to-pink-500",
};

const RANK_ICONS: Record<string, string> = {
  NOVATO: "🔥",
  BRO_DA_PANELA: "🍺",
  MESTRE_DO_MALTE: "⚗️",
  ALQUIMISTA: "🧪",
  LEGEND: "👑",
};

interface RankBadgeProps {
  rank: string;
  xp: number;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, xp, size = "md" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  const colorClass = RANK_COLORS[rank] || RANK_COLORS.NOVATO;
  const icon = RANK_ICONS[rank] || RANK_ICONS.NOVATO;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r text-white font-bold shadow-lg",
        `bg-gradient-to-r ${colorClass}`,
        sizeClasses[size]
      )}
    >
      <span>{icon}</span>
      <span>{rank.replace(/_/g, " ")}</span>
      <span className="text-xs opacity-80">{xp} XP</span>
    </div>
  );
}
