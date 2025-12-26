import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  Award,
  Settings,
  LogOut,
  Flame,
  Zap,
  TrendingUp,
  History,
  Crown,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { UpgradeCTA } from "../common/PricingSection";
import { ROUTES } from "@/shared/routes";

// TODO: [BETA] Configure final feedback email/URL here
const BETA_FEEDBACK_EMAIL = "feedback@brocraft.app";
const BETA_FEEDBACK_SUBJECT = "BROCRAFT Beta Feedback";

interface DashboardLayoutProps {
  children: ReactNode;
  userRank?: string;
  userXp?: number;
  userTier?: string;
  userStreak?: number;
  onLogout?: () => void;
}

const MENU_ITEMS = [
  { icon: Home, label: "Home", href: ROUTES.HOME },
  { icon: BookOpen, label: "Receitas", href: ROUTES.RECIPES },
  { icon: History, label: "Histórico", href: ROUTES.HISTORY },
  { icon: Award, label: "Badges", href: ROUTES.BADGES },
  { icon: Users, label: "Comunidade", href: ROUTES.COMMUNITY },
  { icon: Settings, label: "Configurações", href: ROUTES.SETTINGS, disabled: true },
];

export function DashboardLayout({
  children,
  userRank,
  userXp = 0,
  userTier = "FREE",
  userStreak = 0,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const xpPercentage = Math.min((userXp / 1000) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border/60 transform transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 h-24 border-b border-border/60 flex items-center justify-between px-6 bg-sidebar/85 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-pulse">🔥</div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                BROCRAFT
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">v∞</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile Card */}
        {userRank && (
          <div className="px-4 py-6 border-b border-border/60">
            <div className="bg-gradient-to-br from-primary/20 via-amber-500/20 to-royal-500/18 border border-primary/30 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-primary uppercase font-bold tracking-widest">
                  Seu Rank
                </p>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent mb-4">
                {userRank.replace(/_/g, " ")}
              </h3>

              {/* XP Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold">
                    EXPERIÊNCIA
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {userXp} / 1000
                  </span>
                </div>
                <div className="h-2.5 bg-card/60 rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-amber-500 to-royal-500 rounded-full transition-all duration-700 shadow-lg shadow-primary/40"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(xpPercentage)}% para próximo nível
                </p>
              </div>

              {/* Tier Badge */}
              <div className="mt-4 pt-4 border-t border-primary/30">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Tier
                </p>
                <div className="inline-block bg-gradient-to-r from-primary to-amber-600 text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                  {userTier}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-6 space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest px-3 mb-4">
            Navegação
          </p>
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.disabled ? undefined : item.href}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  setSidebarOpen(false);
                }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 text-base font-semibold transition-all rounded-lg py-6 ${
                    isActive
                      ? "bg-gradient-to-r from-primary/25 to-amber-600/25 text-primary border-l-4 border-primary shadow-lg shadow-primary/20"
                      : item.disabled
                      ? "text-muted-foreground cursor-not-allowed opacity-40"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  disabled={item.disabled}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-semibold">
                      Soon
                    </span>
                  )}
                </Button>
              </a>
            );
          })}
        </nav>

        {/* Stats Section */}
        <div className="px-3 py-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest px-3 mb-4">
            Estatísticas
          </p>
          <div className="space-y-3">
            <div className="bg-card/60 border border-border/60 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Progresso</span>
              </div>
              <p className="text-lg font-bold text-blue-400">
                {Math.round(xpPercentage)}%
              </p>
            </div>
            <div className="bg-card/60 border border-border/60 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {userStreak} {userStreak === 1 ? "dia" : "dias"}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="px-3 pb-4">
          <UpgradeCTA currentTier={userTier} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout Button */}
        {onLogout && (
          <div className="px-3 py-6 border-t border-border/60 sticky bottom-0 bg-sidebar/85 backdrop-blur-sm">
            <Button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-destructive/20 to-royal-500/20 hover:from-destructive/30 hover:to-royal-500/30 text-foreground border border-border/60 justify-start gap-3 font-semibold py-6 rounded-lg"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Beta Banner */}
        <div className="bg-gradient-to-r from-primary/90 to-amber-700/90 text-primary-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-2">
            <span className="animate-pulse">🔥</span>
            <span className="font-bold">BROCRAFT v∞ — Beta Fechado</span>
          </span>
          <span className="hidden sm:inline text-primary-foreground/80">|</span>
          <a
            href={`mailto:${BETA_FEEDBACK_EMAIL}?subject=${encodeURIComponent(BETA_FEEDBACK_SUBJECT)}`}
            className="flex items-center gap-1 text-primary-foreground/90 hover:text-foreground underline underline-offset-2 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Enviar Feedback
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Top Bar */}
        <div className="h-20 border-b border-border/60 bg-card/70 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-card/70 border border-border/60 rounded-lg backdrop-blur-sm">
              <Flame className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary">
                {userXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-10">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 lg:hidden z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
  );
}
