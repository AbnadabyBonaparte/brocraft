import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatBox } from "@/components/ChatBox";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { trpc } from "@/lib/trpc";
import { Loader2, Flame, BookOpen, Users, Zap, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [chatKey, setChatKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
          <p className="text-gray-400 font-semibold">Carregando BROCRAFT...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />

        {/* Footer */}
        <footer className="bg-gray-950 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  BROCRAFT
                </h3>
                <p className="text-gray-400 text-sm">
                  Seu assistente IA para fermentação caseira.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-orange-400">Receitas</a></li>
                  <li><a href="#" className="hover:text-orange-400">Chat IA</a></li>
                  <li><a href="#" className="hover:text-orange-400">Comunidade</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-orange-400">Termos</a></li>
                  <li><a href="#" className="hover:text-orange-400">Privacidade</a></li>
                  <li><a href="#" className="hover:text-orange-400">LGPD</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase mb-4">Contato</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-orange-400">Email</a></li>
                  <li><a href="#" className="hover:text-orange-400">Twitter</a></li>
                  <li><a href="#" className="hover:text-orange-400">Discord</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
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
          <p className="text-gray-400 text-lg">
            Explore receitas, faça perguntas e ganhe XP enquanto aprende a fermentar como um pro.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                Seu Assistente IA
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatKey(prev => prev + 1)}
                className="text-gray-400 border-gray-700 hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <ChatBox key={chatKey} />
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-gray-700/50 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Explorar</h3>
              </div>
              <div className="p-6 space-y-3">
                <a href="/receitas">
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 text-orange-300 border border-orange-500/30 py-6 font-semibold rounded-lg">
                    <BookOpen className="h-5 w-5 mr-3" />
                    Receitas
                    <ArrowRight className="h-4 w-4 ml-auto text-orange-400" />
                  </Button>
                </a>
                <Button
                  disabled
                  className="w-full justify-start bg-gray-800/30 text-gray-500 border border-gray-700/50 py-6 font-semibold rounded-lg cursor-not-allowed opacity-50"
                >
                  <Users className="h-5 w-5 mr-3" />
                  Comunidade
                  <span className="ml-auto text-xs bg-gray-900 px-2 py-1 rounded-full">
                    Em breve
                  </span>
                </Button>
                <Button
                  disabled
                  className="w-full justify-start bg-gray-800/30 text-gray-500 border border-gray-700/50 py-6 font-semibold rounded-lg cursor-not-allowed opacity-50"
                >
                  <Zap className="h-5 w-5 mr-3" />
                  Badges
                  <span className="ml-auto text-xs bg-gray-900 px-2 py-1 rounded-full">
                    Em breve
                  </span>
                </Button>
              </div>
            </Card>

            {/* Tip Card */}
            <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 backdrop-blur-sm">
              <div className="p-6">
                <p className="text-sm text-orange-200 leading-relaxed">
                  <span className="font-bold text-orange-300">💡 Dica Pro:</span> Faça perguntas específicas sobre fermentação para ganhar mais XP e subir de rank!
                </p>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-4">
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Receitas</p>
                <p className="text-2xl font-black text-orange-400">50+</p>
              </Card>
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-4">
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Streak</p>
                <p className="text-2xl font-black text-red-400">5 dias</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
