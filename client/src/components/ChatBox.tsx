import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = trpc.chat.send.useMutation();
  const historyQuery = trpc.chat.history.useQuery({ limit: 50 });
  const saveHistoryMutation = trpc.conversationHistory.save.useMutation();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    if (historyQuery.data) {
      const loadedMessages = historyQuery.data
        .reverse()
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
    }
  }, [historyQuery.data]);

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
    if (!input.trim()) return;

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
            background: "linear-gradient(135deg, #f97316, #ef4444)",
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
                background: badge.color || "#8B5CF6",
                color: "white",
                border: "none",
              },
            });
          }, (index + 1) * 1000); // Stagger badge notifications
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Erro ao processar sua mensagem. Tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-amber-50">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <h1 className="text-2xl font-bold">🔥 BROCRAFT v∞</h1>
        <p className="text-sm opacity-90">Fogo aceso. Fermento vivo.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-xs lg:max-w-md px-4 py-3 ${
                msg.role === "user"
                  ? "bg-orange-600 text-white rounded-lg"
                  : "bg-white text-gray-900 rounded-lg border border-orange-200"
              }`}
            >
              <Streamdown>{msg.content}</Streamdown>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 text-orange-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>BROCRAFT está pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-orange-200 space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte algo sobre fermentação..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>XP Ganho: +{totalXpGained}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={saveHistoryMutation.isPending}
            className="ml-auto text-orange-600 hover:text-orange-700"
          >
            {saveHistoryMutation.isPending ? "Salvando..." : "Resetar Chat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
