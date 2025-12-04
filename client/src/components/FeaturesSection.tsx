import { Card } from "@/components/ui/card";
import {
  Zap,
  Users,
  TrendingUp,
  Shield,
  Lightbulb,
  Award,
  BookOpen,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat com IA",
    description: "Converse com um assistente IA que entende de fermentação. Faça perguntas e receba respostas personalizadas em tempo real.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: BookOpen,
    title: "50+ Receitas",
    description: "Acesso a receitas detalhadas de cerveja, fermentados, queijos e charcutaria. Cada receita com 3 níveis de dificuldade.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Sistema de XP",
    description: "Ganhe experiência ao completar receitas e interagir com a IA. Suba de rank e desbloqueie novas funcionalidades.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Award,
    title: "Badges & Achievements",
    description: "Conquiste badges exclusivos ao atingir marcos importantes. Mostre suas conquistas para a comunidade.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Progresso Rastreado",
    description: "Acompanhe seu progresso em tempo real. Veja quantas receitas você completou e quanto XP ganhou.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Avisos de Segurança",
    description: "Receba alertas sobre riscos de botulismo, destilação ilegal e outras considerações de segurança importantes.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Conecte-se com outros fermentadores. Compartilhe dicas, receitas e experiências com a comunidade BROCRAFT.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lightbulb,
    title: "Dicas Profissionais",
    description: "Receba macetes e dicas de especialistas para aprimorar suas técnicas de fermentação.",
    color: "from-cyan-500 to-blue-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Funcionalidades Poderosas
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tudo que você precisa para dominar a arte da fermentação caseira
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all group overflow-hidden"
              >
                {/* Top Accent */}
                <div
                  className={`h-1 bg-gradient-to-r ${feature.color}`}
                />

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
