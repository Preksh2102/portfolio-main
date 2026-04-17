import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, FileText, Mail, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  projects: number;
  papers: number;
  messages: number;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats>({ projects: 0, papers: 0, messages: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [projectsRes, papersRes, messagesRes] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("research_papers").select("id", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    setStats({
      projects: projectsRes.count || 0,
      papers: papersRes.count || 0,
      messages: messagesRes.count || 0,
    });
  };

  const statCards = [
    { label: "Total Projects", value: stats.projects, icon: FolderKanban, color: "text-blue-500" },
    { label: "Research Papers", value: stats.papers, icon: FileText, color: "text-green-500" },
    { label: "Unread Messages", value: stats.messages, icon: Mail, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/admin/projects"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <FolderKanban className="w-5 h-5 text-primary" />
            <span>Manage Projects</span>
          </a>
          <a
            href="/admin/papers"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span>Manage Research Papers</span>
          </a>
          <a
            href="/admin/resume"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Eye className="w-5 h-5 text-primary" />
            <span>Update Resume</span>
          </a>
          <a
            href="/admin/messages"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Mail className="w-5 h-5 text-primary" />
            <span>View Messages</span>
          </a>
        </div>
      </div>
    </div>
  );
}
