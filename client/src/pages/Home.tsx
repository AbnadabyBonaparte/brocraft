import { useAuth } from "@/_core/hooks/useAuth";
import { ChatBox } from "@/components/common/ChatBox";
import { FeaturesSection } from "@/components/common/FeaturesSection";
import { HeroSection } from "@/components/common/HeroSection";
import { OnboardingCard } from "@/components/common/OnboardingCard";
import { PricingSection } from "@/components/common/PricingSection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ROUTES } from "@/shared/routes";
import {
  Loader2,
  Flame,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [chatKey, setChatKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-semibold">
            Carregando BROCRAFT...
          </p>
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <DashboardLayout onLogout={logout}>
        <Card className="bg-destructive/10 border-destructive/30 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-destructive font-semibold">
              Erro ao carregar perfil.
            </p>
            <p className="text-foreground/80 text-sm">
              Verifique sua conexão e tente novamente.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => profileQuery.refetch()}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />

        {/* Footer */}
        <footer className="bg-background border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  BROCRAFT
                </h3>
                <p className="text-muted-foreground text-sm">
                  Seu assistente IA para fermentação caseira.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase mb-4">
                  Produto
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary">
                      Receitas
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Chat IA
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Comunidade
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase mb-4">
                  Legal
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href={ROUTES.TERMS} className="hover:text-primary">
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href={ROUTES.PRIVACY} className="hover:text-primary">
                      Privacidade
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase mb-4">
                  Contato
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary">
                      Email
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary">
                      Discord
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 BROCRAFT v∞. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
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
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            Bem-vindo, {user?.name?.split(" ")[0]}! 🔥
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore receitas, faça perguntas e ganhe XP enquanto aprende a
            fermentar como um pro.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame className="h-6 w-6 text-primary" />
                Seu Assistente IA
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatKey(prev => prev + 1)}
                className="text-muted-foreground border-border hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
            <div className="bg-card/80 border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <ChatBox key={chatKey} />
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Onboarding Card */}
            <OnboardingCard />

            {/* Quick Actions */}
            <Card className="bg-card/80 border-border backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 to-destructive/20 border-b border-border px-6 py-4">
                <h3 className="text-lg font-bold text-foreground">Explorar</h3>
              </div>
              <div className="p-6 space-y-3">
                <a href={ROUTES.RECIPES}>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 text-orange-300 border border-orange-500/30 py-6 font-semibold rounded-lg">
                    <BookOpen className="h-5 w-5 mr-3" />
                    Receitas
                    <ArrowRight className="h-4 w-4 ml-auto text-orange-400" />
                  </Button>
                </a>
                <a href={ROUTES.COMMUNITY}>
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 border border-blue-500/30 py-6 font-semibold rounded-lg">
                    <Users className="h-5 w-5 mr-3" />
                    Comunidade
                    <ArrowRight className="h-4 w-4 ml-auto text-blue-400" />
                  </Button>
                </a>
                <a href={ROUTES.BADGES}>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-300 border border-purple-500/30 py-6 font-semibold rounded-lg">
                    <Award className="h-5 w-5 mr-3" />
                    Badges
                    <ArrowRight className="h-4 w-4 ml-auto text-purple-400" />
                  </Button>
                </a>
              </div>
            </Card>

            {/* Tip Card */}
            <Card className="bg-gradient-to-br from-primary/20 to-destructive/20 border border-primary/30 backdrop-blur-sm">
              <div className="p-6">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <span className="font-bold text-primary">💡 Dica Pro:</span>{" "}
                  Faça perguntas específicas sobre fermentação para ganhar mais
                  XP e subir de rank!
                </p>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/80 border-border backdrop-blur-sm p-4">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">
                  Receitas
                </p>
                <p className="text-2xl font-black text-primary">50+</p>
              </Card>
              <Card className="bg-card/80 border-border backdrop-blur-sm p-4">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">
                  Streak
                </p>
                <p className="text-2xl font-black text-destructive">5 dias</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
