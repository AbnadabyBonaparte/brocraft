import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Loader2, Crown, Sparkles, ArrowRight, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

export default function UpgradeSuccess() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  const getColorToken = (variable: string, fallback: string) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
    return value || fallback;
  };

  // Pegar tier da query string
  const urlParams = new URLSearchParams(window.location.search);
  const tier = urlParams.get("tier") || "MESTRE";

  // Buscar status atual do billing
  const billingQuery = trpc.billing.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 2000, // Refetch a cada 2s até tier ser atualizado
    refetchIntervalInBackground: false,
  });

  // Dispara confetti quando carrega
  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true);

      // Confetti burst
      const duration = 3000;
      const end = Date.now() + duration;
      const gold = getColorToken("--color-primary", "#d4af37");
      const ember = getColorToken("--color-orange-500", "#d67a2c");
      const glow = getColorToken("--color-royal-500", "#b497ff");
      const confettiColors = [gold, ember, glow];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: confettiColors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: confettiColors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [showConfetti]);

  const tierInfo = {
    MESTRE: {
      icon: <Sparkles className="h-16 w-16 text-orange-400" />,
      title: "Bem-vindo ao Plano MESTRE! ⚗️",
      description: "Agora você tem acesso a 100 mensagens diárias no chat, badges exclusivos e muito mais!",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-600/20 to-red-600/20",
    },
    CLUBE_BRO: {
      icon: <Crown className="h-16 w-16 text-purple-400" />,
      title: "Bem-vindo ao CLUBE BRO! 👑",
      description: "Você agora é um membro VIP com acesso ilimitado ao chat, todas as receitas premium e suporte prioritário!",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-600/20 to-pink-600/20",
    },
  };

  const info = tierInfo[tier as keyof typeof tierInfo] || tierInfo.MESTRE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4 text-foreground">
      <Card className={`max-w-lg w-full bg-gradient-to-br ${info.bgColor} border-none backdrop-blur-sm p-8 text-center`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center shadow-2xl`}>
            {info.icon}
          </div>
        </div>

        {/* Success Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
          <span className="text-green-400 font-bold">Pagamento Confirmado!</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-foreground mb-4">
          {info.title}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-6">
          {info.description}
        </p>

        {/* Status */}
        {billingQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando status...</span>
          </div>
        ) : billingQuery.data?.tier === tier ? (
          <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
            <PartyPopper className="h-5 w-5" />
            <span className="font-semibold">Seu plano já está ativo!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-primary mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Ativando seu plano...</span>
          </div>
        )}

        {/* Features Preview */}
        <div className="bg-card/60 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-muted-foreground uppercase font-bold mb-3">O que você ganhou:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {tier === "CLUBE_BRO" ? (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Chat com IA ilimitado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Todas as receitas premium
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Comunidade VIP
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Suporte prioritário
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  100 mensagens diárias no chat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Badges exclusivos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Acesso à comunidade
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA */}
        <Button
          onClick={() => setLocation("/")}
          className={`w-full bg-gradient-to-r ${info.color} hover:opacity-90 text-primary-foreground font-bold py-6 text-lg`}
        >
          Começar a Fermentar
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </Card>
    </div>
  );
}




