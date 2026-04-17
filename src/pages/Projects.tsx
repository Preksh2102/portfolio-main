import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "All",
  "Machine Learning",
  "Computer Vision",
  "LLM",
  "NLP",
  "Robotics",
  "Android Development"
];

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
  category: string | null;
  is_featured: boolean;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeProjectRow = (row: any): Project => {
    const tags = (row?.tags ?? row?.tech_stack ?? []) as string[];
    const github_url = (row?.github_url ?? row?.githubUrl ?? null) as string | null;
    const demo_url = (row?.demo_url ?? row?.demoUrl ?? null) as string | null;
    const image_url = (row?.image_url ?? row?.imageUrl ?? null) as string | null;
    const is_featured = (row?.is_featured ?? row?.isFeatured ?? false) as boolean;
    return { ...row, tags, github_url, demo_url, image_url, is_featured };
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    // Some deployments may not have `display_order`; retry with a safe fallback.
    let res = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });

    if (
      res.error &&
      (/Could not find the 'display_order' column of 'projects'/i.test(res.error.message) ||
        /column\s+projects\.display_order\s+does\s+not\s+exist/i.test(res.error.message))
    ) {
      res = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    }

    if (!res.error && res.data) {
      setProjects((res.data as any[]).map(normalizeProjectRow));
    }
    setLoading(false);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI <span className="text-primary">Projects</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore my collection of AI and machine learning projects, from
            research prototypes to production-ready applications.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
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
                is_featured={project.is_featured}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              No projects yet. Add projects from the admin panel.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              No projects found matching your criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
