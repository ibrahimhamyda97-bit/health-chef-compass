import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Refrigerator, CakeSlice, CalendarDays, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Accueil", path: "/", icon: LayoutDashboard },
  { label: "Recettes", path: "/recettes", icon: Search },
  { label: "Frigo", path: "/frigo", icon: Refrigerator },
  { label: "Boulanger", path: "/boulanger", icon: CakeSlice },
  { label: "Planning", path: "/planning", icon: CalendarDays },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTap = (path: string) => {
    // Haptic-like feedback via short vibration if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => handleTap(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-xl transition-all duration-200 active:scale-90",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
