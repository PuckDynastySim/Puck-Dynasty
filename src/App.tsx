
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import LeagueCreation from "./pages/LeagueCreation";
import UserManagement from "./pages/UserManagement";
import TeamManagement from "./pages/TeamManagement";
import PlayerGenerator from "./pages/PlayerGenerator";
import PlayerManagement from "./pages/PlayerManagement";
import CoachGenerator from "./pages/CoachGenerator";
import CoachManagement from "./pages/CoachManagement";
import Reports from "./pages/Reports";
import LeagueStats from "./pages/LeagueStats";
import LeagueHistory from "./pages/LeagueHistory";
import ScheduleBuilder from "./pages/ScheduleBuilder";
import SimulationEngine from "./pages/SimulationEngine";
import GMDashboard from "./pages/GMDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/leagues/new" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <LeagueCreation />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/players" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <PlayerManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/players/generate" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <PlayerGenerator />
              </ProtectedRoute>
            } />
            <Route path="/admin/coaches" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <CoachGenerator />
              </ProtectedRoute>
            } />
            <Route path="/admin/coaches/manage" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <CoachManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/schedule/builder" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <ScheduleBuilder />
              </ProtectedRoute>
            } />
            <Route path="/admin/simulation" element={
              <ProtectedRoute allowedRoles={['admin', 'commissioner']}>
                <SimulationEngine />
              </ProtectedRoute>
            } />
            <Route path="/gm" element={
              <ProtectedRoute allowedRoles={['gm']}>
                <GMDashboard />
              </ProtectedRoute>
            } />
            <Route path="/league-stats" element={<LeagueStats />} />
            <Route path="/league-history" element={<LeagueHistory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
