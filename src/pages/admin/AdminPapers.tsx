import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, FileText, Upload } from "lucide-react";
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

interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  field: string | null;
  published_date: string | null;
  pdf_url: string | null;
  is_published: boolean | null;
}

const defaultPaper: Omit<Paper, "id"> = {
  title: "",
  abstract: "",
  field: "LLMs",
  published_date: new Date().toISOString().split("T")[0],
  pdf_url: "",
  is_published: true,
};

export default function AdminPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState(defaultPaper);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    const { data, error } = await supabase
      .from("research_papers")
      .select("*")
      .order("published_date", { ascending: false });

    if (!error && data) {
      setPapers(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Error", description: "Please upload a PDF file", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("papers")
      .upload(fileName, file);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("papers").getPublicUrl(fileName);
      setFormData({ ...formData, pdf_url: urlData.publicUrl });
      toast({ title: "Success", description: "PDF uploaded" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPaper) {
      const { error } = await supabase
        .from("research_papers")
        .update(formData)
        .eq("id", editingPaper.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Paper updated" });
      }
    } else {
      const { error } = await supabase.from("research_papers").insert(formData);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Paper created" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchPapers();
  };

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      abstract: paper.abstract || "",
      field: paper.field || "LLMs",
      published_date: paper.published_date || "",
      pdf_url: paper.pdf_url || "",
      is_published: paper.is_published ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;

    const { error } = await supabase.from("research_papers").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Paper deleted" });
      fetchPapers();
    }
  };

  const resetForm = () => {
    setEditingPaper(null);
    setFormData(defaultPaper);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Research Papers</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4" />
              Add Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPaper ? "Edit Paper" : "Add Paper"}</DialogTitle>
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
                <label className="block text-sm font-medium mb-1">Abstract</label>
                <Textarea
                  value={formData.abstract || ""}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Field</label>
                  <select
                    value={formData.field || ""}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="LLMs">LLMs</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="AI Ethics">AI Ethics</option>
                    <option value="Prompt Engineering">Prompt Engineering</option>
                    <option value="NLP">NLP</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Published Date</label>
                  <Input
                    type="date"
                    value={formData.published_date || ""}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PDF File</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {formData.pdf_url && (
                  <a
                    href={formData.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    View current PDF
                  </a>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published ?? true}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Published (visible to public)</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPaper ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {papers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No papers yet. Add your first research paper!
          </div>
        ) : (
          papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{paper.title}</h3>
                    {!paper.is_published && (
                      <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paper.field} • {paper.published_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(paper)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(paper.id)}>
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
