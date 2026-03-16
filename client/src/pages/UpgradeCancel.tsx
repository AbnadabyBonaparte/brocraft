import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowRight, HelpCircle } from "lucide-react";

export default function UpgradeCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-card/80 border-border backdrop-blur-sm p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-foreground mb-4">
          Checkout Cancelado
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-6">
          O processo de pagamento foi cancelado. Não se preocupe, nenhuma
          cobrança foi realizada.
        </p>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="font-semibold">Teve algum problema?</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Se você encontrou algum erro durante o checkout ou tem dúvidas sobre
            os planos, entre em contato conosco. Estamos aqui para ajudar!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-primary to-destructive hover:opacity-90 text-primary-foreground font-bold py-6"
          >
            Voltar ao Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setLocation("/");
              setTimeout(() => {
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="w-full border-border text-foreground hover:bg-muted py-6"
          >
            Ver Planos Novamente
          </Button>
        </div>

        {/* Support */}
        <p className="mt-6 text-sm text-muted-foreground">
          Precisa de ajuda?{" "}
          <a
            href="mailto:suporte@brocraft.app"
            className="text-primary hover:underline"
          >
            Fale conosco
          </a>
        </p>
      </Card>
    </div>
  );
}
