import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <a href="/">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </a>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
          </div>

          <div className="prose prose-invert prose-orange max-w-none">
            <p className="text-gray-400 text-sm mb-6">Última atualização: Janeiro de 2025</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-300">
              Ao acessar ou usar o BROCRAFT ("Serviço"), você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deve usar o Serviço.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Uso Educacional</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 my-4">
              <p className="text-amber-200 font-semibold">IMPORTANTE</p>
              <p className="text-amber-100/80 text-sm mt-2">
                O conteúdo do BROCRAFT é estritamente educacional e informativo. 
                Não substitui consultoria profissional técnica, legal ou sanitária. 
                Você é totalmente responsável por suas produções e decisões.
              </p>
            </div>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Bebidas Alcoólicas</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 my-4">
              <p className="text-red-200 font-semibold">ATENÇÃO</p>
              <ul className="text-red-100/80 text-sm mt-2 space-y-1">
                <li>• Proibido para menores de idade conforme legislação local</li>
                <li>• Respeite as leis de seu país/região sobre produção e consumo de álcool</li>
                <li>• A produção caseira pode ser regulamentada ou proibida em sua jurisdição</li>
                <li>• Consuma com responsabilidade</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Segurança Alimentar</h2>
            <p className="text-gray-300">
              A fermentação e produção de alimentos envolve riscos se não for feita corretamente.
              Siga sempre boas práticas de higiene e segurança alimentar.
              O BROCRAFT não se responsabiliza por problemas de saúde decorrentes de produções caseiras.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Limitação de Responsabilidade</h2>
            <p className="text-gray-300">
              O BROCRAFT é fornecido "como está". Não garantimos que o serviço estará sempre disponível,
              que as informações são 100% precisas ou completas, ou resultados específicos de suas produções.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Contato</h2>
            <p className="text-gray-300">
              Para dúvidas sobre estes termos, entre em contato através do formulário de feedback no aplicativo
              ou pelo email: legal@brocraft.app
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}




