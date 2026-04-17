import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminResume() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchResumeUrl();
  }, []);

  const fetchResumeUrl = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "resume_url")
      .maybeSingle();

    if (data?.value) {
      setResumeUrl(data.value);
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
    const fileName = `resume-${Date.now()}.pdf`;

    // Delete old resume if exists
    if (resumeUrl) {
      const oldFileName = resumeUrl.split("/").pop();
      if (oldFileName) {
        await supabase.storage.from("resume").remove([oldFileName]);
      }
    }

    const { data, error } = await supabase.storage
      .from("resume")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("resume").getPublicUrl(fileName);
      
      // Update site settings
      await supabase
        .from("site_settings")
        .update({ value: urlData.publicUrl })
        .eq("key", "resume_url");

      setResumeUrl(urlData.publicUrl);
      toast({ title: "Success", description: "Resume uploaded successfully" });
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!resumeUrl) return;
    if (!confirm("Are you sure you want to delete the resume?")) return;

    const fileName = resumeUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("resume").remove([fileName]);
    }

    await supabase
      .from("site_settings")
      .update({ value: "" })
      .eq("key", "resume_url");

    setResumeUrl(null);
    toast({ title: "Success", description: "Resume deleted" });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Resume</h1>

      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-xl border border-border bg-card"
        >
          {resumeUrl ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Resume Uploaded</h3>
                  <p className="text-sm text-muted-foreground">
                    Your resume is ready for download
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="default" asChild>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View Resume
                  </a>
                </Button>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Upload a new version:</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Resume Uploaded</h3>
              <p className="text-muted-foreground mb-6">
                Upload your resume in PDF format
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button variant="default" asChild disabled={uploading}>
                  <span className="cursor-pointer">
                    {uploading ? "Uploading..." : "Upload Resume"}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
