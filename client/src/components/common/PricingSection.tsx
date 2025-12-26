import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Loader2, Crown, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/shared/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

const PRICING_PLANS = [
  {
    tier: "FREE" as const,
    name: "FREE",
    price: "Grátis",
    description: "Perfeito para começar",
    icon: "🎯",
    color: "from-gray-500 to-gray-600",
    features: [
      { text: "Chat com IA (10 msgs/dia)", included: true },
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
    tier: "MESTRE" as const,
    name: "MESTRE",
    price: "R$ 9,90",
    period: "/mês",
    description: "Para fermentadores sérios",
    icon: "⚗️",
    color: "from-orange-500 to-red-500",
    features: [
      { text: "Chat com IA (100 msgs/dia)", included: true },
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
    tier: "CLUBE_BRO" as const,
    name: "CLUBE BRO",
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
  const { isAuthenticated } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  const createCheckoutMutation = trpc.billing.createCheckoutSession.useMutation();

  const handleUpgrade = async (tier: "MESTRE" | "CLUBE_BRO") => {
    if (!isAuthenticated) {
      toast.error("Faça login para assinar um plano", {
        action: {
          label: "Login",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }

    setLoadingTier(tier);
    
    try {
      const result = await createCheckoutMutation.mutateAsync({ tier });
      
      if (result.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = result.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      
      if (error?.data?.code === "UNAUTHORIZED") {
        toast.error("Faça login para assinar um plano");
      } else if (error?.data?.code === "BAD_REQUEST") {
        toast.info(error.message || "Você já possui este plano ou superior");
      } else if (error?.data?.code === "PRECONDITION_FAILED") {
        toast.error("Sistema de pagamentos indisponível no momento");
      } else {
        toast.error("Erro ao iniciar checkout. Tente novamente.");
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const handlePlanClick = (plan: typeof PRICING_PLANS[number]) => {
    if (plan.tier === "FREE") {
      window.location.href = getLoginUrl();
    } else {
      handleUpgrade(plan.tier);
    }
  };

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
                <Button
                  variant={plan.ctaVariant}
                  onClick={() => handlePlanClick(plan)}
                  disabled={loadingTier === plan.tier}
                  className={`w-full font-bold py-3 rounded-lg transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-orange-500/50"
                      : plan.tier === "CLUBE_BRO"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {loadingTier === plan.tier ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                      {plan.tier === "CLUBE_BRO" && <Crown className="h-4 w-4 mr-2" />}
                      {plan.cta}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-lg">
            Todos os planos incluem{" "}
            <span className="text-orange-400 font-bold">7 dias de trial grátis</span>.
            Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Componente de Upgrade CTA para usar no Dashboard
 */
export function UpgradeCTA({ currentTier }: { currentTier?: string }) {
  const { isAuthenticated } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  const createCheckoutMutation = trpc.billing.createCheckoutSession.useMutation();

  if (!isAuthenticated) return null;
  
  // Não mostrar para usuários CLUBE_BRO
  if (currentTier === "CLUBE_BRO") {
    return (
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-bold text-purple-300">Membro do CLUBE BRO</span>
        </div>
        <p className="text-xs text-purple-300/70 mt-1">Acesso completo a todos os recursos</p>
      </div>
    );
  }

  const handleUpgrade = async (tier: "MESTRE" | "CLUBE_BRO") => {
    setLoadingTier(tier);
    try {
      const result = await createCheckoutMutation.mutateAsync({ tier });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  // Mostrar upgrade para MESTRE se FREE, ou para CLUBE_BRO se MESTRE
  const targetTier = currentTier === "MESTRE" ? "CLUBE_BRO" : "MESTRE";
  const tierInfo = {
    MESTRE: {
      icon: <Sparkles className="h-5 w-5 text-orange-400" />,
      label: "Vire MESTRE",
      price: "R$ 9,90/mês",
      color: "from-orange-600/20 to-red-600/20 border-orange-500/30",
      btnColor: "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
    },
    CLUBE_BRO: {
      icon: <Crown className="h-5 w-5 text-purple-400" />,
      label: "Entre no CLUBE BRO",
      price: "R$ 19,90/mês",
      color: "from-purple-600/20 to-pink-600/20 border-purple-500/30",
      btnColor: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    },
  };

  const info = tierInfo[targetTier];

  return (
    <div className={`bg-gradient-to-r ${info.color} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {info.icon}
        <span className="text-sm font-bold text-white">{info.label}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{info.price} • Cancele quando quiser</p>
      <Button
        onClick={() => handleUpgrade(targetTier)}
        disabled={loadingTier === targetTier}
        className={`w-full bg-gradient-to-r ${info.btnColor} text-white text-sm py-2`}
        size="sm"
      >
        {loadingTier === targetTier ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Fazer Upgrade"
        )}
      </Button>
    </div>
  );
}
