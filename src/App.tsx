import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NutritionProvider } from "@/context/NutritionContext";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Overview from "@/pages/Overview";
import MyFridge from "@/pages/MyFridge";
import RecipeSearch from "@/pages/RecipeSearch";
import HealthGoals from "@/pages/HealthGoals";
import Favorites from "@/pages/Favorites";
import ShoppingList from "@/pages/ShoppingList";
import Planning from "@/pages/Planning";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NutritionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/frigo" element={<MyFridge />} />
                <Route path="/recettes" element={<RecipeSearch />} />
                <Route path="/courses" element={<ShoppingList />} />
                <Route path="/objectifs" element={<HealthGoals />} />
                <Route path="/favoris" element={<Favorites />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NutritionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
