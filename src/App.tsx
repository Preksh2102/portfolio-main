import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Research from "./pages/Research";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminPapers from "./pages/admin/AdminPapers";
import AdminResume from "./pages/admin/AdminResume";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes with layout */}
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/projects" element={<Layout><Projects /></Layout>} />
              <Route path="/research" element={<Layout><Research /></Layout>} />
              <Route path="/resume" element={<Layout><Resume /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/auth" element={<Layout><Auth /></Layout>} />
              
              {/* Admin routes without layout */}
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminHome />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="papers" element={<AdminPapers />} />
                <Route path="resume" element={<AdminResume />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
