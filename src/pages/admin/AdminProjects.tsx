import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Star, GitFork, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  is_featured: boolean | null;
}

const defaultProject: Omit<Project, "id"> = {
  title: "",
  description: "",
  tags: [],
  stars: 0,
  forks: 0,
  github_url: "",
  demo_url: "",
  image_url: "",
  category: "Machine Learning",
  is_featured: false,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(defaultProject);
  const [tagsInput, setTagsInput] = useState("");
  const { toast } = useToast();

  const normalizeExternalUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const normalizeProjectRow = (row: any): Project => {
    const tags = (row?.tags ?? row?.tech_stack ?? []) as string[];
    const github_url = (row?.github_url ?? row?.githubUrl ?? null) as string | null;
    const demo_url = (row?.demo_url ?? row?.demoUrl ?? null) as string | null;
    const image_url = (row?.image_url ?? row?.imageUrl ?? null) as string | null;
    const is_featured = (row?.is_featured ?? row?.isFeatured ?? null) as boolean | null;
    return { ...row, tags, github_url, demo_url, image_url, is_featured };
  };

  const getMissingColumn = (message: string) => {
    const m = message.match(/Could not find the '([^']+)' column of 'projects'/i);
    return m?.[1] ?? null;
  };

  const renameMissingColumn = (payload: Record<string, unknown>, missing: string) => {
    const next: Record<string, unknown> = { ...payload };
    const swap = (fromKey: string, toKey: string) => {
      if (Object.prototype.hasOwnProperty.call(next, fromKey)) {
        next[toKey] = next[fromKey];
        delete next[fromKey];
      }
    };

    if (missing === "tags") swap("tags", "tech_stack");
    else if (missing === "tech_stack") swap("tech_stack", "tags");
    else if (missing === "demo_url") swap("demo_url", "demoUrl");
    else if (missing === "demoUrl") swap("demoUrl", "demo_url");
    else if (missing === "github_url") swap("github_url", "githubUrl");
    else if (missing === "githubUrl") swap("githubUrl", "github_url");
    else if (missing === "image_url") swap("image_url", "imageUrl");
    else if (missing === "imageUrl") swap("imageUrl", "image_url");
    else if (missing === "is_featured") swap("is_featured", "isFeatured");
    else if (missing === "isFeatured") swap("isFeatured", "is_featured");

    return next;
  };

  const insertWithSchemaFallback = async (payload: Record<string, unknown>) => {
    let current = payload;
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error } = await supabase.from("projects").insert(current as any);
      if (!error) return { error: null as any };
      const missing = getMissingColumn(error.message);
      if (!missing) return { error };
      const next = renameMissingColumn(current, missing);
      if (next === current) return { error };
      current = next;
    }
    return { error: { message: "Insert failed after schema fallback attempts." } as any };
  };

  const updateWithSchemaFallback = async (id: string, payload: Record<string, unknown>) => {
    let current = payload;
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error } = await supabase.from("projects").update(current as any).eq("id", id);
      if (!error) return { error: null as any };
      const missing = getMissingColumn(error.message);
      if (!missing) return { error };
      const next = renameMissingColumn(current, missing);
      if (next === current) return { error };
      current = next;
    }
    return { error: { message: "Update failed after schema fallback attempts." } as any };
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

    if (res.error) {
      toast({ title: "Error", description: res.error.message, variant: "destructive" });
      return;
    }

    if (res.data) {
      setProjects((res.data as any[]).map(normalizeProjectRow));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const projectData = {
      ...formData,
      tags: parsedTags,
    };

    if (editingProject) {
      const { error } = await updateWithSchemaFallback(editingProject.id, projectData as any);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Project updated" });
    } else {
      const { error } = await insertWithSchemaFallback(projectData as any);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Project created" });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchProjects();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      tags: project.tags || [],
      stars: project.stars || 0,
      forks: project.forks || 0,
      github_url: project.github_url || "",
      demo_url: project.demo_url || "",
      image_url: project.image_url || "",
      category: project.category || "Machine Learning",
      is_featured: project.is_featured || false,
    });
    setTagsInput((project.tags || []).join(", "));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Project deleted" });
      fetchProjects();
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData(defaultProject);
    setTagsInput("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Python, TensorFlow, Computer Vision"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="LLM">LLM</option>
                    <option value="NLP">NLP</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Android Development">Android Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Featured</label>
                  <label className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Show on homepage</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stars</label>
                  <Input
                    type="number"
                    value={formData.stars || 0}
                    onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Forks</label>
                  <Input
                    type="number"
                    value={formData.forks || 0}
                    onChange={(e) => setFormData({ ...formData, forks: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <Input
                  type="url"
                  value={formData.github_url || ""}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Demo URL</label>
                <Input
                  type="url"
                  value={formData.demo_url || ""}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProject ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No projects yet. Add your first project!
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  {project.is_featured && (
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {project.stars !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {project.stars}
                    </span>
                  )}
                  {project.forks !== null && (
                    <span className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {project.forks}
                    </span>
                  )}
                  {project.github_url && (
                    <a href={normalizeExternalUrl(project.github_url)} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={normalizeExternalUrl(project.demo_url)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
