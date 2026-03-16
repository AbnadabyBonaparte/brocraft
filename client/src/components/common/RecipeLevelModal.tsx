import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Flame, Zap, Crown } from "lucide-react";

interface RecipeLevelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeName: string;
  onSelectLevel: (level: "RAJADO" | "CLASSICO" | "MESTRE") => void;
  isLoading?: boolean;
}

const LEVELS = [
  {
    id: "RAJADO",
    name: "🔥 Rajado",
    description: "Perfeito para iniciantes",
    icon: Flame,
    color: "from-orange-500 to-orange-600",
    features: [
      "Instruções passo a passo",
      "Ingredientes comuns",
      "Tempo: 7-14 dias",
      "Risco baixo",
    ],
    xp: 50,
  },
  {
    id: "CLASSICO",
    name: "⚗️ Clássico",
    description: "Para quem já tem experiência",
    icon: Zap,
    color: "from-yellow-500 to-yellow-600",
    features: [
      "Técnicas avançadas",
      "Ingredientes especiais",
      "Tempo: 21-60 dias",
      "Risco moderado",
    ],
    xp: 150,
  },
  {
    id: "MESTRE",
    name: "👑 Mestre",
    description: "Para os verdadeiros mestres",
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    features: [
      "Técnicas profissionais",
      "Ingredientes premium",
      "Tempo: 60+ dias",
      "Risco alto, recompensa máxima",
    ],
    xp: 300,
  },
];

export function RecipeLevelModal({
  open,
  onOpenChange,
  recipeName,
  onSelectLevel,
  isLoading = false,
}: RecipeLevelModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<
    "RAJADO" | "CLASSICO" | "MESTRE" | null
  >(null);

  const handleSelect = (level: "RAJADO" | "CLASSICO" | "MESTRE") => {
    setSelectedLevel(level);
    onSelectLevel(level);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground">
            Escolha seu Nível
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Receita:{" "}
            <span className="font-bold text-orange-400">{recipeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {LEVELS.map(level => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;

            return (
              <Card
                key={level.id}
                onClick={() => !isLoading && handleSelect(level.id as any)}
                className={`cursor-pointer transition-all border-2 overflow-hidden ${
                  isSelected
                    ? "border-primary bg-card"
                    : "border-border bg-card/80 hover:border-muted-foreground"
                }`}
              >
                {/* Header */}
                <div
                  className={`h-24 bg-gradient-to-br ${level.color} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-20">
                    <Icon className="absolute top-2 right-2 h-12 w-12" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between p-4 text-primary-foreground">
                    <h3 className="text-lg font-black">{level.name}</h3>
                    <p className="text-xs font-semibold opacity-90">
                      {level.description}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {level.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-orange-400 font-bold mt-0.5">
                          ✓
                        </span>
                        <span className="text-sm text-primary-foreground/90">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* XP Reward */}
                  <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-3">
                    <p className="text-xs text-orange-300 uppercase font-bold mb-1">
                      Recompensa
                    </p>
                    <p className="text-xl font-black text-orange-400">
                      +{level.xp} XP
                    </p>
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => !isLoading && handleSelect(level.id as any)}
                    disabled={isLoading}
                    className={`w-full font-bold py-2 rounded-lg transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-primary to-destructive text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {isLoading && selectedLevel === level.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Iniciando...
                      </>
                    ) : (
                      <>{isSelected ? "✓ Selecionado" : "Escolher"}</>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-semibold">Dica:</span> Você pode tentar
            novamente em outro nível depois. Escolha o nível que melhor se
            adequa ao seu conhecimento!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
