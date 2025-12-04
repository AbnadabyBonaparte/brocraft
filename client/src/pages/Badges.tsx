import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Lock } from "lucide-react";

export default function Badges() {
  const { logout, isAuthenticated } = useAuth();

  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const userBadgesQuery = trpc.gamification.getBadges.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const allBadgesQuery = trpc.gamification.getAllBadgeDefinitions.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <p className="text-gray-400">Por favor, faça login para ver seus badges.</p>
      </div>
    );
  }

  const earnedBadgeTypes = new Set(
    userBadgesQuery.data?.map((b) => b.type) || []
  );

  const allBadges = allBadgesQuery.data || [];
  const earnedBadges = userBadgesQuery.data || [];

  return (
    <DashboardLayout
      userRank={profileQuery.data?.rank}
      userXp={profileQuery.data?.xp}
      userTier={profileQuery.data?.tier}
      userStreak={profileQuery.data?.streak}
      onLogout={logout}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Award className="h-8 w-8 text-orange-500" />
            Suas Conquistas
          </h1>
          <p className="text-gray-400 text-lg">
            Desbloqueie badges completando desafios no BROCRAFT!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 p-4">
            <p className="text-xs text-orange-300 uppercase font-bold mb-1">
              Badges Conquistados
            </p>
            <p className="text-3xl font-black text-orange-400">
              {earnedBadges.length}
            </p>
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Total Disponível
            </p>
            <p className="text-3xl font-black text-gray-300">
              {allBadges.length}
            </p>
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Progresso
            </p>
            <p className="text-3xl font-black text-blue-400">
              {allBadges.length > 0
                ? Math.round((earnedBadges.length / allBadges.length) * 100)
                : 0}
              %
            </p>
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Faltam
            </p>
            <p className="text-3xl font-black text-purple-400">
              {allBadges.length - earnedBadges.length}
            </p>
          </Card>
        </div>

        {/* Badges Conquistados */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🏆 Badges Conquistados
          </h2>

          {userBadgesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border-gray-700/50 overflow-hidden hover:border-orange-500/50 transition-all"
                >
                  <div
                    className="h-2"
                    style={{ backgroundColor: badge.color || "#f97316" }}
                  />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                        style={{
                          backgroundColor: `${badge.color}20` || "#f9731620",
                          border: `2px solid ${badge.color || "#f97316"}`,
                        }}
                      >
                        {badge.icon || "🏆"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {badge.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Conquistado em{" "}
                          {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800/30 border-gray-700/50 p-8 text-center">
              <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Você ainda não conquistou nenhum badge.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Continue usando o BROCRAFT para desbloquear conquistas!
              </p>
            </Card>
          )}
        </div>

        {/* Badges Bloqueados */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-gray-500" />
            Badges para Desbloquear
          </h2>

          {allBadgesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBadges
                .filter((badge) => !earnedBadgeTypes.has(badge.type))
                .map((badge) => (
                  <Card
                    key={badge.type}
                    className="bg-gray-900/50 border-gray-800/50 overflow-hidden opacity-60 hover:opacity-80 transition-all"
                  >
                    <div className="h-2 bg-gray-700" />
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gray-800 border-2 border-gray-700">
                          <Lock className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-400 text-lg">
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {badge.description}
                          </p>
                          <p className="text-xs text-orange-500/70 mt-2 font-semibold">
                            🔒 Bloqueado
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {allBadges.filter((b) => !earnedBadgeTypes.has(b.type)).length ===
            0 && (
            <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 p-8 text-center">
              <p className="text-orange-300 text-lg font-bold">
                🎉 Parabéns! Você conquistou todos os badges!
              </p>
              <p className="text-orange-400/70 text-sm mt-2">
                Você é um verdadeiro Mestre Fermentador!
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

