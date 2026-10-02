import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/theme";
import { UiProvider } from "@/contexts/ui";
import AppLayout from "@/layouts/AppLayout";
import { PageSkeleton } from "@/components/ui";
import { toast } from "@/lib/toast";
import AccessCode from "@/pages/AccessCode";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Today = lazy(() => import("@/pages/Today"));
const Upcoming = lazy(() => import("@/pages/Upcoming"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Completed = lazy(() => import("@/pages/Completed"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
  mutationCache: new MutationCache({ onError: (e) => toast(e instanceof Error ? e.message : "Couldn't save. Please try again.") }),
});

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8"><PageSkeleton /></div>;
  if (!user) return <Navigate to="/access" replace />;
  return <UiProvider><AppLayout /></UiProvider>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="p-8"><PageSkeleton /></div>}>
              <Routes>
                <Route path="/access" element={<AccessCode />} />
                <Route element={<Protected />}>
                  <Route index element={<Dashboard />} />
                  <Route path="today" element={<Today />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="upcoming" element={<Upcoming />} />
                  <Route path="completed" element={<Completed />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
