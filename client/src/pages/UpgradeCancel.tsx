import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowRight, MessageCircle, HelpCircle } from "lucide-react";

export default function UpgradeCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-gray-700/30 flex items-center justify-center">
            <XCircle className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-white mb-4">
          Checkout Cancelado
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg mb-6">
          O processo de pagamento foi cancelado. Não se preocupe, nenhuma cobrança foi realizada.
        </p>

        {/* Info */}
        <div className="bg-gray-900/30 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-300 mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-orange-400" />
            <span className="font-semibold">Teve algum problema?</span>
          </p>
          <p className="text-sm text-gray-400">
            Se você encontrou algum erro durante o checkout ou tem dúvidas sobre os planos, 
            entre em contato conosco. Estamos aqui para ajudar!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6"
          >
            Voltar ao Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Scroll para pricing section na home
              setLocation("/");
              setTimeout(() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 py-6"
          >
            Ver Planos Novamente
          </Button>
        </div>

        {/* Support */}
        <p className="mt-6 text-sm text-gray-500">
          Precisa de ajuda?{" "}
          <a href="mailto:suporte@brocraft.app" className="text-orange-400 hover:underline">
            Fale conosco
          </a>
        </p>
      </Card>
    </div>
  );
}




