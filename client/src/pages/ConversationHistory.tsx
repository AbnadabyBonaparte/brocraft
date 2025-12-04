import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, Trash2, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function ConversationHistory() {
  const { user, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const historyQuery = trpc.conversationHistory.getHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: isAuthenticated }
  );

  const selectedConvQuery = trpc.conversationHistory.getById.useQuery(
    { conversationId: selectedConversation! },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  const deleteConvMutation = trpc.conversationHistory.delete.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
      setSelectedConversation(null);
    },
  });

  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <p className="text-gray-400">Por favor, faça login para ver seu histórico.</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRank={profileQuery.data?.rank}
      userXp={profileQuery.data?.xp}
      userTier={profileQuery.data?.tier}
      userStreak={profileQuery.data?.streak}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            Histórico de Conversas 📚
          </h1>
          <p className="text-gray-400 text-lg">
            Revise suas conversas anteriores e aprenda com elas.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations List (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-500" />
              Suas Conversas
            </h2>

            {historyQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : historyQuery.data && historyQuery.data.length > 0 ? (
              <div className="space-y-3">
                {historyQuery.data.map((conv) => (
                  <Card
                    key={conv.id}
                    className={`bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-4 cursor-pointer transition-all hover:bg-gray-800/50 ${
                      selectedConversation === conv.id
                        ? "border-orange-500/50 bg-gray-800/50"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{conv.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {conv.messageCount} mensagens • +{conv.xpGained} XP
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(conv.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-orange-500" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-8 text-center">
                <p className="text-gray-400">Nenhuma conversa salva ainda.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Suas conversas aparecerão aqui quando você resetar o chat.
                </p>
              </Card>
            )}
          </div>

          {/* Conversation Details (1/3) */}
          <div className="space-y-6">
            {selectedConversation && selectedConvQuery.data ? (
              <>
                <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-gray-700/50 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">
                      {selectedConvQuery.data.title}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {(selectedConvQuery.data.messages as any[]).map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-xs font-bold text-orange-400 uppercase">
                          {msg.role === "user" ? "Você" : "BROCRAFT"}
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (selectedConversation) {
                      deleteConvMutation.mutate({ conversationId: selectedConversation });
                    }
                  }}
                  disabled={deleteConvMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteConvMutation.isPending ? "Deletando..." : "Deletar Conversa"}
                </Button>
              </>
            ) : (
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-6 text-center">
                <p className="text-gray-400">Selecione uma conversa para ver os detalhes.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
