import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFilteredData } from "@/hooks/useFilteredData";
import { trpc } from "@/lib/trpc";
import { Loader2, Award, Lock, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Badges() {
  const { logout, isAuthenticated } = useAuth();

  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 20000,
  });

  const userBadgesQuery = trpc.gamification.getBadges.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
    retry: 2,
  });

  const allBadgesQuery = trpc.gamification.getAllBadgeDefinitions.useQuery(undefined, {
    refetchInterval: 30000,
    retry: 2,
  });

  const earnedBadgeTypes = new Set(
    userBadgesQuery.data?.map((b) => b.type) || []
  );

  const allBadges = allBadgesQuery.data || [];
  const earnedBadges = userBadgesQuery.data || [];
  const lockedBadges = useFilteredData(allBadgesQuery.data, {
    customFilter: (badge) => !earnedBadgeTypes.has(badge.type),
    dependencies: [earnedBadges.length],
  });

  const isLoadingAny =
    profileQuery.isLoading || userBadgesQuery.isLoading || allBadgesQuery.isLoading;
  const isErrorAny = profileQuery.isError || userBadgesQuery.isError || allBadgesQuery.isError;

  const handleRetry = () => {
    profileQuery.refetch();
    userBadgesQuery.refetch();
    allBadgesQuery.refetch();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <p className="text-gray-400">Por favor, faça login para ver seus badges.</p>
      </div>
    );
  }

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

        {isErrorAny && (
          <Card className="bg-red-900/20 border-red-500/30 p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div className="space-y-2">
              <p className="text-red-200 font-semibold">Erro ao carregar seus dados de gamificação.</p>
              <p className="text-red-100/80 text-sm">
                Verifique sua conexão e tente novamente para ver seu progresso.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-red-400/50 text-red-100 hover:bg-red-500/10"
                onClick={handleRetry}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recarregar dados
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 p-4">
            <p className="text-xs text-orange-300 uppercase font-bold mb-1">
              Badges Conquistados
            </p>
            {isLoadingAny ? (
              <Skeleton className="h-10 w-20 bg-orange-500/30" />
            ) : (
              <p className="text-3xl font-black text-orange-400">
                {earnedBadges.length}
              </p>
            )}
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Total Disponível
            </p>
            {isLoadingAny ? (
              <Skeleton className="h-10 w-16 bg-gray-700" />
            ) : (
              <p className="text-3xl font-black text-gray-300">
                {allBadges.length}
              </p>
            )}
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Progresso
            </p>
            {isLoadingAny ? (
              <Skeleton className="h-10 w-24 bg-blue-500/30" />
            ) : (
              <p className="text-3xl font-black text-blue-400">
                {allBadges.length > 0
                  ? Math.round((earnedBadges.length / allBadges.length) * 100)
                  : 0}
                %
              </p>
            )}
          </Card>
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Faltam
            </p>
            {isLoadingAny ? (
              <Skeleton className="h-10 w-16 bg-purple-500/30" />
            ) : (
              <p className="text-3xl font-black text-purple-400">
                {Math.max(allBadges.length - earnedBadges.length, 0)}
              </p>
            )}
          </Card>
        </div>

        {/* Badges Conquistados */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            🏆 Badges Conquistados
          </h2>

          {userBadgesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userBadgesQuery.isError ? (
            <Card className="bg-red-900/20 border-red-500/30 p-6 text-center">
              <p className="text-red-200 font-semibold mb-2">Erro ao carregar badges conquistados.</p>
              <p className="text-red-100/80 text-sm">Tente novamente em instantes.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-red-400/50 text-red-100 hover:bg-red-500/10"
                onClick={handleRetry}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </Card>
          ) : earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className="bg-gradient-to-br from-card/70 to-card/50 border-border/60 overflow-hidden hover:border-primary/40 transition-all"
                >
                  <div
                    className="h-2"
                    style={{ backgroundColor: badge.color || "var(--color-primary)" }}
                  />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                        style={{
                          backgroundColor: badge.color
                            ? `${badge.color}33`
                            : "color-mix(in srgb, var(--color-primary) 25%, transparent)",
                          border: `2px solid ${badge.color || "var(--color-primary)"}`,
                          color: badge.color || "var(--color-primary)",
                        }}
                      >
                        {badge.icon || "🏆"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {badge.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
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
              <Card className="bg-card/60 border-border/60 p-8 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Você ainda não conquistou nenhum badge.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Continue usando o BROCRAFT para desbloquear conquistas!
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() => (window.location.href = "/recipes")}
                >
                  Explorar desafios
                </Button>
              </Card>
            )}
        </div>

        {/* Badges Bloqueados */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            Badges para Desbloquear
          </h2>

          {allBadgesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allBadgesQuery.isError ? (
            <Card className="bg-red-900/20 border-red-500/30 p-6 text-center">
              <p className="text-red-200 font-semibold mb-2">Erro ao carregar badges disponíveis.</p>
              <p className="text-red-100/80 text-sm">Tente novamente em instantes.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4 border-red-400/50 text-red-100 hover:bg-red-500/10"
                onClick={handleRetry}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadges.map((badge) => (
                <Card
                  key={badge.type}
                  className="bg-card/50 border-border/60 overflow-hidden opacity-60 hover:opacity-80 transition-all"
                >
                  <div className="h-2 bg-muted" />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-muted border-2 border-border text-muted-foreground">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div className="flex-1 text-muted-foreground">
                        <h3 className="font-bold text-foreground text-lg">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {badge.description}
                        </p>
                        <p className="text-xs text-primary mt-2 font-semibold">
                          🔒 Bloqueado
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

            {lockedBadges.length === 0 && (
              <Card className="bg-gradient-to-br from-primary/20 to-amber-600/20 border-primary/30 p-8 text-center">
                <p className="text-primary text-lg font-bold">
                  🎉 Parabéns! Você conquistou todos os badges!
                </p>
                <p className="text-primary/80 text-sm mt-2">
                  Você é um verdadeiro Mestre Fermentador!
                </p>
              </Card>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}

