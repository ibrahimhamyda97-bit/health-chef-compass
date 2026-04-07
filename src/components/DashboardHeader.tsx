import { User, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { mode } = useNutrition();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center gap-4 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <SidebarTrigger className="shrink-0" />

      <div className="flex-1" />

      <div className="flex items-center gap-3 ml-auto">
        <Badge
          variant="secondary"
          className={`hidden sm:flex text-xs font-medium rounded-full px-3 py-1 ${
            mode === "perte" ? "bg-emerald-soft text-emerald" : "gradient-cobalt text-primary-foreground"
          }`}
        >
          {mode === "perte" ? "🎯 Perte de Poids" : "💪 Prise de Masse"}
        </Badge>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-cobalt flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden md:inline text-sm font-medium text-foreground truncate max-w-[120px]">
              {user.user_metadata?.display_name || user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/auth")}
            className="rounded-xl"
          >
            Se connecter
          </Button>
        )}
      </div>
    </header>
  );
}
