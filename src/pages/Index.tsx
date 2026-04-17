import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Code, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  stars: number | null;
  forks: number | null;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  is_featured: boolean | null;
}

interface Settings {
  tagline: string;
  bio: string;
}

const stats = [
  { label: "AI Projects", value: "15+", icon: Code },
  { label: "Research Papers", value: "5", icon: FileText },
  { label: "GitHub Stars", value: "1.2K", icon: Sparkles },
];

export default function Index() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<Settings>({ tagline: "", bio: "" });
  const [projectCount, setProjectCount] = useState(0);
  const [paperCount, setPaperCount] = useState(0);

  const normalizeProjectRow = (row: any): Project => {
    const tags = (row?.tags ?? row?.tech_stack ?? []) as string[];
    const github_url = (row?.github_url ?? row?.githubUrl ?? null) as string | null;
    const demo_url = (row?.demo_url ?? row?.demoUrl ?? null) as string | null;
    const image_url = (row?.image_url ?? row?.imageUrl ?? null) as string | null;
    const is_featured = (row?.is_featured ?? row?.isFeatured ?? null) as boolean | null;
    return { ...row, tags, github_url, demo_url, image_url, is_featured };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch featured projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(3);

    // Fallback for schemas without `display_order`
    if (!projects) {
      const fallback = await supabase
        .from("projects")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (fallback.data) setFeaturedProjects((fallback.data as any[]).map(normalizeProjectRow));
    } else {
      setFeaturedProjects((projects as any[]).map(normalizeProjectRow));
    }

    // Fetch settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value");

    if (settingsData) {
      const settingsObj: any = {};
      settingsData.forEach((item) => {
        settingsObj[item.key] = item.value;
      });
      setSettings({
        tagline: settingsObj.tagline || "Student | ML enthusiast",
        bio: settingsObj.bio || "Machine Learning enthusiast passionate about advancing AI capabilities through innovative projects and cutting-edge research.",
      });
    }

    // Fetch counts
    const { count: pCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true });
    
    const { count: rCount } = await supabase
      .from("research_papers")
      .select("id", { count: "exact", head: true });

    setProjectCount(pCount || 0);
    setPaperCount(rCount || 0);
  };

  const dynamicStats = [
    { label: "AI Projects", value: projectCount > 0 ? `${projectCount}` : "15+", icon: Code },
    { label: "Research Papers", value: paperCount > 0 ? `${paperCount}` : "5", icon: FileText },
    { label: "GitHub Stars", value: "1.2K", icon: Sparkles },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[96px] animate-float" style={{ animationDelay: "-3s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
            >
              <Brain className="w-4 h-4" />
              <span>{"Student | Machine Learning"}</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-balance">
              Building the Future with{" "}
              <span className="text-primary">Artificial Intelligence</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
              {settings.bio}
            </p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/projects">
                  View Projects
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/research">Read Research</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {dynamicStats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Featured <span className="text-primary">Projects</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of my most impactful AI and machine learning projects,
              showcasing innovation in various domains.
            </p>
          </motion.div>

          {featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description || ""}
                  tags={project.tags || []}
                  stars={project.stars || undefined}
                  forks={project.forks || undefined}
                  githubUrl={project.github_url || undefined}
                  demoUrl={project.demo_url || undefined}
                  imageUrl={project.image_url || undefined}
                  index={index}
                  is_featured={Boolean(project.is_featured)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Add featured projects from the admin panel.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" asChild>
              <Link to="/projects">
                View All Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Interested in <span className="text-primary">Collaborating</span>?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              I'm always open to discussing new projects, research opportunities,
              or potential collaborations in the AI space.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
