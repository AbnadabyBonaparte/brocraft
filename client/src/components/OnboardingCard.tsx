/**
 * OnboardingCard - Componente de onboarding para novos usuários
 * 
 * Exibe uma lista de tarefas iniciais para guiar o usuário.
 * Usa localStorage para persistir o progresso.
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  MessageSquare, 
  BookOpen, 
  Award, 
  Users,
  X,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";

const ONBOARDING_STORAGE_KEY = "brocraft_onboarding";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  checkCondition?: () => boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "first_message",
    title: "Envie sua primeira mensagem",
    description: "Converse com o assistente BROCRAFT",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/",
  },
  {
    id: "view_recipes",
    title: "Explore as receitas",
    description: "Descubra receitas de fermentação",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/receitas",
  },
  {
    id: "view_badges",
    title: "Veja seus badges",
    description: "Confira suas conquistas",
    icon: <Award className="h-5 w-5" />,
    href: "/badges",
  },
  {
    id: "visit_community",
    title: "Visite a comunidade",
    description: "Conecte-se com outros Bros",
    icon: <Users className="h-5 w-5" />,
    href: "/comunidade",
  },
];

interface OnboardingState {
  completedSteps: string[];
  dismissed: boolean;
  completedAt?: string;
}

function getOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { completedSteps: [], dismissed: false };
}

function saveOnboardingState(state: OnboardingState): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Ignore storage errors
  }
}

export function OnboardingCard() {
  const [state, setState] = useState<OnboardingState>(getOnboardingState);
  const [, navigate] = useLocation();

  // Salvar estado sempre que mudar
  useEffect(() => {
    saveOnboardingState(state);
  }, [state]);

  // Não mostrar se foi dispensado ou se completou tudo
  if (state.dismissed || state.completedSteps.length >= ONBOARDING_STEPS.length) {
    return null;
  }

  const progress = (state.completedSteps.length / ONBOARDING_STEPS.length) * 100;

  const handleStepClick = (step: OnboardingStep) => {
    // Marcar como completado
    if (!state.completedSteps.includes(step.id)) {
      const newCompletedSteps = [...state.completedSteps, step.id];
      const newState: OnboardingState = {
        ...state,
        completedSteps: newCompletedSteps,
        completedAt: newCompletedSteps.length >= ONBOARDING_STEPS.length 
          ? new Date().toISOString() 
          : undefined,
      };
      setState(newState);
    }
    // Navegar para a página
    navigate(step.href);
  };

  const handleDismiss = () => {
    setState({ ...state, dismissed: true });
  };

  return (
    <Card className="bg-gradient-to-br from-orange-600/10 via-red-600/10 to-pink-600/10 border-orange-500/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-400" />
          <h3 className="font-bold text-white">Primeiros Passos</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{state.completedSteps.length} de {ONBOARDING_STEPS.length} completos</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="p-4 pt-0 space-y-2">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = state.completedSteps.includes(step.id);
          
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                isCompleted
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 hover:border-orange-500/30"
              }`}
            >
              <div className={`flex-shrink-0 ${isCompleted ? "text-green-400" : "text-orange-400"}`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isCompleted ? "text-green-300 line-through" : "text-white"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {step.description}
                </p>
              </div>
              {!isCompleted && (
                <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * Hook para verificar se o onboarding foi completado
 */
export function useOnboardingComplete(): boolean {
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const state = getOnboardingState();
    setIsComplete(state.completedSteps.length >= ONBOARDING_STEPS.length || state.dismissed);
  }, []);
  
  return isComplete;
}

/**
 * Função para marcar uma etapa como completa programaticamente
 */
export function markOnboardingStepComplete(stepId: string): void {
  const state = getOnboardingState();
  if (!state.completedSteps.includes(stepId)) {
    state.completedSteps.push(stepId);
    saveOnboardingState(state);
  }
}

