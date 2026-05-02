import { LayoutDashboard, Refrigerator, ChefHat, Target, Heart, ShoppingCart, CalendarDays, ShieldCheck, Palette, BookOpen, CakeSlice, Search } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Vue d'ensemble", url: "/", icon: LayoutDashboard },
  { title: "Trouver Une Recette", url: "/recettes", icon: Search },
  { title: "Mon Frigo", url: "/frigo", icon: Refrigerator },
  { title: "Au Boulanger", url: "/boulanger", icon: CakeSlice },
  { title: "Mon Planning", url: "/planning", icon: CalendarDays },
  { title: "Liste de Courses", url: "/courses", icon: ShoppingCart },
];

const advancedItems = [
  { title: "Objectif Santé", url: "/objectifs", icon: Target },
  { title: "Favoris", url: "/favoris", icon: Heart },
  { title: "Art du Dressage", url: "/dressage", icon: Palette },
  { title: "Cours Pâtisserie", url: "/cours-patisserie", icon: BookOpen },
];

const adminItems = [
  { title: "Administration", url: "/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderGroup = (items: typeof mainItems, label?: string) => (
    <SidebarGroup>
      {label && !collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 px-3 py-2.5"
                  activeClassName="bg-gradient-to-r from-sidebar-accent to-sidebar-accent/60 text-sidebar-accent-foreground font-semibold shadow-sm"
                >
                  <item.icon className="mr-3 h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-sidebar-accent-foreground leading-tight">Tableau de Board</span>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight">Menu intelligent</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center mx-auto shadow-md">
            <ChefHat className="w-5 h-5 text-accent-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-2">
        {renderGroup(mainItems, "Navigation")}
        <div className="mx-4 my-1 border-t border-sidebar-border/30" />
        {renderGroup(advancedItems, "Avancé")}
        <div className="mx-4 my-1 border-t border-sidebar-border/30" />
        {renderGroup(adminItems, "Gestion")}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/30 text-center">v2.0 — HaMenu Chef</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
