import { Card } from "@/components/ui/card";
import { Zap, Trophy, Award } from "lucide-react";

interface ProfileCardProps {
  rank: string;
  xp: number;
  tier: string;
  badges?: number;
}

export function ProfileCard({ rank, xp, tier, badges = 0 }: ProfileCardProps) {
  const xpPercentage = Math.min((xp / 1000) * 100, 100);
  const rankColor = {
    NOVATO: "from-gray-400 to-gray-600",
    BRO_DA_PANELA: "from-orange-400 to-orange-600",
    MESTRE_DO_MALTE: "from-yellow-400 to-yellow-600",
    ALQUIMISTA: "from-purple-400 to-purple-600",
    LEGEND: "from-red-500 to-pink-500",
  }[rank] || "from-gray-400 to-gray-600";

  return (
    <Card className="bg-white border-gray-200 overflow-hidden">
      {/* Header Gradient */}
      <div className={`h-24 bg-gradient-to-r ${rankColor}`} />

      {/* Content */}
      <div className="px-6 py-6">
        {/* Rank Badge */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Seu Rank
          </p>
          <h3 className="text-2xl font-bold text-gray-900">
            {rank.replace(/_/g, " ")}
          </h3>
        </div>

        {/* XP Progress */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Experiência
            </p>
            <p className="text-sm font-semibold text-gray-900">{xp} XP</p>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {Math.round(xpPercentage)}% para próximo nível
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <p className="text-xs font-semibold text-gray-500 uppercase">Tier</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{tier}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-semibold text-gray-500 uppercase">Badges</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{badges}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
