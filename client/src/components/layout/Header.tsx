import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { ROUTES } from "@/shared/routes";

interface HeaderProps {
  title: string;
  icon?: ReactNode;
  showBack?: boolean;
  onLogout?: () => void;
  rightContent?: ReactNode;
}

export function Header({
  title,
  icon,
  showBack = false,
  onLogout,
  rightContent,
}: HeaderProps) {
  const [, navigate] = useLocation();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.HOME)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              {icon && <div className="text-2xl">{icon}</div>}
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {rightContent}
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
