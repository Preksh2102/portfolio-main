import { useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  File,
  Settings,
  LogOut,
  Mail,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/papers", label: "Research Papers", icon: FileText },
  { href: "/admin/resume", label: "Resume", icon: File },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminDashboard() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Admin<span className="text-primary">Panel</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.href
              : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin" : "User"}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
