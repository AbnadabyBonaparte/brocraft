import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, AlertTriangle, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Carga aceita. BROCRAFT v∞ online. Fogo aceso. Fermento vivo. 🔥\n\nO que você quer fermentar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalXpGained, setTotalXpGained] = useState(0);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = trpc.chat.send.useMutation();
  const historyQuery = trpc.chat.history.useQuery(
    { limit: 50 },
    { refetchInterval: 8000, staleTime: 5000, retry: 2 }
  );
  const saveHistoryMutation = trpc.conversationHistory.save.useMutation();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    if (!historyQuery.data) return;

    const serverMessages = [...historyQuery.data]
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((msg) => ({
        id: msg.id?.toString?.(),
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));

    if (serverMessages.length === 0) return;

    setMessages((prev) => {
      if (!hasLoadedHistory || prev.length === 0) {
        return serverMessages;
      }

      const existingIds = new Set(prev.map((m) => m.id).filter(Boolean));
      const merged = [...prev];

      serverMessages.forEach((msg) => {
        const isDuplicateId = msg.id && existingIds.has(msg.id);
        const isDuplicateContent = merged.some(
          (m) =>
            !msg.id &&
            m.role === msg.role &&
            m.content === msg.content &&
            (m.timestamp?.getTime?.() || 0) === (msg.timestamp?.getTime?.() || 0)
        );

        if (!isDuplicateId && !isDuplicateContent) {
          merged.push(msg);
        }
      });

      return merged.sort(
        (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
      );
    });

    setHasLoadedHistory(true);
  }, [hasLoadedHistory, historyQuery.data]);

  const handleReset = async () => {
    // Save conversation history
    const userMessages = messages.filter((m) => m.role === "user");
    const title = userMessages.length > 0 
      ? userMessages[0].content.substring(0, 50) 
      : "Conversa sem título";
    
    try {
      await saveHistoryMutation.mutateAsync({
        title,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date(),
        })),
        xpGained: totalXpGained,
      });
    } catch (error) {
      console.error("Failed to save history:", error);
    }

    // Reset chat
    setMessages([
      {
        role: "assistant",
        content: "Carga aceita. BROCRAFT v∞ online. Fogo aceso. Fermento vivo. 🔥\n\nO que você quer fermentar hoje?",
        timestamp: new Date(),
      },
    ]);
    setTotalXpGained(0);
  };

  const handleSend = async () => {
    if (!input.trim() || limitReached) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await sendMutation.mutateAsync({ message: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response, timestamp: new Date() },
      ]);

      // Atualizar mensagens restantes
      if (response.messagesRemaining !== undefined && response.messagesRemaining !== null) {
        setMessagesRemaining(response.messagesRemaining);
        if (response.messagesRemaining <= 0) {
          setLimitReached(true);
        }
      }

      // Show XP notification with toast
      if (response.xpGained > 0) {
        setTotalXpGained((prev) => prev + response.xpGained);
        toast.success(`+${response.xpGained} XP`, {
          description: "Continue a brassagem! 🍺",
          duration: 3000,
        });
      }

      // Show rank up toast
      if (response.rankUp && response.newRank) {
        const rankName = response.newRank.replace(/_/g, " ");
        toast("🎉 Rank Up!", {
          description: `Você alcançou o rank ${rankName}!`,
          duration: 5000,
          style: {
            background: "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-rose-500) 80%, transparent))",
            color: "white",
            border: "none",
          },
        });
      }

      // Show badge notifications
      if (response.newBadges && response.newBadges.length > 0) {
        response.newBadges.forEach((badge, index) => {
          setTimeout(() => {
            toast("🏆 Novo Badge!", {
              description: `${badge.icon} ${badge.name}`,
              duration: 5000,
              style: {
                background: badge.color || "var(--color-royal-500)",
                color: "white",
                border: "none",
              },
            });
          }, (index + 1) * 1000); // Stagger badge notifications
        });
      }
    } catch (error: any) {
      console.error("[BROCRAFT][Chat] Error:", error);
      
      // Verificar se é erro de limite de mensagens (FORBIDDEN)
      const errorCode = error?.data?.code || error?.shape?.data?.code;
      const errorMessage = error?.message || error?.shape?.message;
      
      if (errorCode === "FORBIDDEN" && errorMessage?.includes("limite")) {
        setLimitReached(true);
        setMessagesRemaining(0);
        toast.error("Limite de mensagens atingido! 📊", {
          description: "Faça upgrade para continuar conversando.",
          action: {
            label: "Ver Planos",
            onClick: () => window.location.href = "/#pricing",
          },
          duration: 10000,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ **Limite diário atingido!**\n\nVocê usou todas as mensagens do seu plano hoje. Para continuar aprendendo sobre fermentação, considere fazer upgrade para o plano MESTRE ou CLUBE BRO.\n\n🔥 O BROCRAFT estará aqui amanhã!",
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Erro ao processar sua mensagem. Tente novamente.",
            timestamp: new Date(),
          },
        ]);
        toast.error("Erro ao enviar mensagem", {
          description: "Tente novamente em alguns instantes.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-b from-orange-50 to-amber-50">
      {/* Header */}
      <div className="p-3 md:p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold">🔥 BROCRAFT v∞</h1>
        <p className="text-xs md:text-sm opacity-90">Fogo aceso. Fermento vivo.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 md:py-3 ${
                msg.role === "user"
                  ? "bg-orange-600 text-white rounded-lg"
                  : "bg-white text-gray-900 rounded-lg border border-orange-200"
              }`}
            >
              <div className="text-sm md:text-base">
                <Streamdown>{msg.content}</Streamdown>
              </div>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 text-orange-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm md:text-base">BROCRAFT está pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-white border-t border-orange-200 space-y-2 flex-shrink-0">
        {/* Limite de mensagens warning */}
        {limitReached && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 md:p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs md:text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">Limite diário atingido. Faça upgrade para continuar!</span>
            <a href="/#pricing" className="text-primary font-semibold hover:underline whitespace-nowrap">
              Ver Planos
            </a>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !limitReached && handleSend()}
            placeholder={limitReached ? "Limite atingido - upgrade" : "Pergunte sobre fermentação..."}
            disabled={isLoading || limitReached}
            className="flex-1 text-sm md:text-base"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || limitReached}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-orange-500" />
            XP: +{totalXpGained}
          </span>
          {messagesRemaining !== null && (
            <span className={`${messagesRemaining <= 3 ? 'text-amber-600 font-semibold' : ''}`}>
              • {messagesRemaining} msgs restantes
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={saveHistoryMutation.isPending}
            className="ml-auto text-orange-600 hover:text-orange-700 text-xs"
          >
            {saveHistoryMutation.isPending ? "Salvando..." : "Resetar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
