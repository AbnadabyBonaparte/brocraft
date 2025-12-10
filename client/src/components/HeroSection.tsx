import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden flex items-center justify-center">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center space-y-6 md:space-y-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-sm">
          <Flame className="h-3 md:h-4 w-3 md:w-4 text-orange-500 animate-pulse" />
          <span className="text-xs md:text-sm font-semibold text-orange-300">
            Transforme sua Fermentação
          </span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              BROCRAFT v∞
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Seu Assistente IA para{" "}
            <span className="text-orange-400">Cerveja Artesanal</span>,{" "}
            <span className="text-orange-400">Fermentados</span>,{" "}
            <span className="text-orange-400">Queijos</span> e{" "}
            <span className="text-orange-400">Charcutaria</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
          Aprenda com um irmão mais velho que sabe tudo sobre fermentação. Receba receitas personalizadas, dicas profissionais e ganhe XP enquanto domina a arte de fermentar como um pro.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 py-4 md:py-8 px-4">
          {[
            { icon: "🤖", label: "Chat com IA", desc: "Respostas em tempo real" },
            { icon: "📚", label: "50+ Receitas", desc: "Conteúdo premium" },
            { icon: "⚡", label: "Sistema de XP", desc: "Gamificação completa" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 md:p-4 hover:border-orange-500/50 transition-all backdrop-blur-sm hover:bg-gray-800/50"
            >
              <div className="text-2xl md:text-3xl mb-2">{feature.icon}</div>
              <p className="font-bold text-gray-200 text-xs md:text-sm mb-1">{feature.label}</p>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 md:pt-8 px-4">
          <a href={getLoginUrl()} className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 md:py-7 text-base md:text-lg font-bold rounded-lg shadow-2xl hover:shadow-orange-500/50 transition-all group px-6 md:px-8">
              <Flame className="h-4 md:h-5 w-4 md:w-5 mr-2 group-hover:animate-pulse" />
              Começar Agora
              <ArrowRight className="h-4 md:h-5 w-4 md:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800/50 py-4 md:py-7 text-base md:text-lg font-bold rounded-lg px-6 md:px-8"
          >
            <Zap className="h-4 md:h-5 w-4 md:w-5 mr-2" />
            Explorar Receitas
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4 md:pt-8 text-xs md:text-sm text-gray-500 px-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-base md:text-xl">✓</span>
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-base md:text-xl">✓</span>
            <span>Acesso instantâneo</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-base md:text-xl">✓</span>
            <span>Comunidade ativa</span>
          </div>
        </div>
      </div>

      {/* Floating Elements - Hidden on mobile for better performance */}
      <div className="hidden md:block absolute top-20 left-10 text-6xl opacity-20 animate-bounce">
        🍺
      </div>
      <div className="hidden md:block absolute bottom-20 right-10 text-6xl opacity-20 animate-bounce" style={{ animationDelay: "0.5s" }}>
        🥒
      </div>
      <div className="hidden md:block absolute top-1/3 right-20 text-5xl opacity-15 animate-pulse">
        🧀
      </div>
    </div>
  );
}
