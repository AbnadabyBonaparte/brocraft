import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
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
            <Shield className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
          </div>

          <div className="prose prose-invert prose-orange max-w-none">
            <p className="text-gray-400 text-sm mb-6">Última atualização: Janeiro de 2025</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Introdução</h2>
            <p className="text-gray-300">
              O BROCRAFT respeita sua privacidade. Esta política explica como coletamos, 
              usamos e protegemos suas informações.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Dados que Coletamos</h2>
            <div className="bg-gray-700/30 rounded-lg p-4 my-4">
              <ul className="text-gray-300 space-y-2">
                <li><strong>Dados de Conta:</strong> Nome, email, foto de perfil (via OAuth)</li>
                <li><strong>Dados de Uso:</strong> Mensagens ao assistente, receitas, XP, badges</li>
                <li><strong>Dados Técnicos:</strong> IP, navegador, sistema operacional</li>
                <li><strong>Pagamentos:</strong> Processados pelo Stripe (não armazenamos cartões)</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Como Usamos seus Dados</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• Fornecer e personalizar o serviço</li>
              <li>• Melhorar a experiência do usuário</li>
              <li>• Comunicar atualizações importantes</li>
              <li>• Prevenir fraudes e abusos</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Seus Direitos (LGPD)</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 my-4">
              <p className="text-blue-200 font-semibold mb-2">Você tem direito a:</p>
              <ul className="text-blue-100/80 text-sm space-y-1">
                <li>• <strong>Acesso:</strong> Solicitar cópia de seus dados</li>
                <li>• <strong>Correção:</strong> Corrigir dados incorretos</li>
                <li>• <strong>Exclusão:</strong> Solicitar exclusão de seus dados</li>
                <li>• <strong>Portabilidade:</strong> Receber seus dados em formato legível</li>
                <li>• <strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Compartilhamento</h2>
            <p className="text-gray-300">
              Não vendemos seus dados. Compartilhamos apenas com provedores de serviço 
              (Stripe para pagamentos), requisições legais, ou para proteger direitos e segurança.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Segurança</h2>
            <p className="text-gray-300">
              Implementamos medidas de segurança incluindo criptografia HTTPS, 
              tokens JWT para autenticação e acesso restrito a dados.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Contato</h2>
            <p className="text-gray-300">
              Para dúvidas sobre privacidade ou exercer seus direitos:
            </p>
            <ul className="text-gray-300 mt-2">
              <li>• Email: privacy@brocraft.app</li>
              <li>• DPO: dpo@brocraft.app</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}




