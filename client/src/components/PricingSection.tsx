import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

const PRICING_PLANS = [
  {
    name: "FREE",
    price: "Grátis",
    description: "Perfeito para começar",
    icon: "🎯",
    color: "from-gray-500 to-gray-600",
    features: [
      { text: "Chat com IA (limitado)", included: true },
      { text: "50 receitas base", included: true },
      { text: "Sistema de XP", included: true },
      { text: "Badges básicos", included: true },
      { text: "Comunidade", included: false },
      { text: "Receitas premium", included: false },
      { text: "Suporte prioritário", included: false },
    ],
    cta: "Começar Agora",
    ctaVariant: "outline" as const,
  },
  {
    name: "MESTRE",
    price: "R$ 9,90",
    period: "/mês",
    description: "Para fermentadores sérios",
    icon: "⚗️",
    color: "from-orange-500 to-red-500",
    features: [
      { text: "Chat com IA (ilimitado)", included: true },
      { text: "50 receitas base", included: true },
      { text: "Sistema de XP", included: true },
      { text: "Badges exclusivos", included: true },
      { text: "Comunidade", included: true },
      { text: "Receitas premium", included: false },
      { text: "Suporte prioritário", included: false },
    ],
    cta: "Assinar Agora",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "CLUBE_BRO",
    price: "R$ 19,90",
    period: "/mês",
    description: "Para os verdadeiros mestres",
    icon: "👑",
    color: "from-purple-500 to-pink-500",
    features: [
      { text: "Chat com IA (ilimitado)", included: true },
      { text: "100+ receitas premium", included: true },
      { text: "Sistema de XP", included: true },
      { text: "Badges exclusivos", included: true },
      { text: "Comunidade VIP", included: true },
      { text: "Receitas premium", included: true },
      { text: "Suporte prioritário", included: true },
    ],
    cta: "Assinar Agora",
    ctaVariant: "default" as const,
  },
];

export function PricingSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Planos Simples e Transparentes
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Escolha o plano que melhor se adequa ao seu estilo de fermentação
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, idx) => (
            <Card
              key={idx}
              className={`relative overflow-hidden transition-all ${
                plan.popular
                  ? "md:scale-105 border-orange-500/50 bg-gray-800/50"
                  : "border-gray-700/50 bg-gray-800/30"
              } hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-sm`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}

              {/* Header */}
              <div
                className={`h-24 bg-gradient-to-br ${plan.color} relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-2 text-4xl">{plan.icon}</div>
                </div>
                <div className="relative h-full flex flex-col justify-between p-6 text-white">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="text-xs font-semibold opacity-90">{plan.description}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Price */}
                <div>
                  <div className="text-4xl font-black text-white">
                    {plan.price}
                    {plan.period && (
                      <span className="text-lg text-gray-400 font-normal">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <a href={getLoginUrl()} className="block">
                  <Button
                    variant={plan.ctaVariant}
                    className={`w-full font-bold py-3 rounded-lg transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-orange-500/50"
                        : "border-gray-700 text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {plan.popular && (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {plan.cta}
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-lg">
            Todos os planos incluem{" "}
            <span className="text-orange-400 font-bold">7 dias de trial grátis</span>.
            Sem cartão de crédito necessário.
          </p>
        </div>
      </div>
    </section>
  );
}
