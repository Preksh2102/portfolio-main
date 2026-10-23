
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminResume() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const bucketName = "resume";

  // Load the saved resume URL when the page opens.
  useEffect(() => {
    void fetchResumeUrl();
  }, []);

  const fetchResumeUrl = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "resume_url")
        .maybeSingle();

      if (error) {
        console.error("Failed to load resume URL:", error);
        throw error;
      }

      const savedUrl =
        typeof data?.value === "string" ? data.value.trim() : "";

      setResumeUrl(savedUrl || null);
      console.log("Saved resume URL loaded:", savedUrl || "(empty)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      toast({
        title: "Could not load resume",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      input.value = "";
      return;
    }

    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "Please select a valid, non-empty PDF.",
        variant: "destructive",
      });
      input.value = "";
      return;
    }

    setUploading(true);

    let uploadedPath: string | null = null;

    try {
      // Check authentication.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Upload session:", {
        hasSession: !!session,
        userId: session?.user?.id,
        error: sessionError?.message,
      });

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      // Confirm the project URL used by the Supabase client.
      console.log("Supabase project:", supabase.storage.url);

      // Upload under a unique path.
      const fileName = `resume-${Date.now()}.pdf`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            contentType: "application/pdf",
            upsert: false,
          });

      if (uploadError) {
        console.error("Storage upload failed:", uploadError);
        throw uploadError;
      }

      uploadedPath = uploadData.path;

      console.log("Upload succeeded:", {
        bucket: bucketName,
        path: uploadData.path,
        id: uploadData.id,
      });

      // Generate the public URL.
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

      const newResumeUrl = publicUrlData.publicUrl;

      console.log("Generated resume URL:", newResumeUrl);

      // Save the URL in site_settings.
      const { data: savedRows, error: saveError } = await supabase
        .from("site_settings")
        .update({ value: newResumeUrl })
        .eq("key", "resume_url")
        .select("key, value");

      if (saveError) {
        console.error("Database update failed:", saveError);
        throw new Error(
          `PDF uploaded, but saving its URL failed: ${saveError.message}`
        );
      }

      if (!savedRows || savedRows.length === 0) {
        throw new Error(
          "PDF uploaded, but no resume_url row was updated. Check the site_settings UPDATE policy."
        );
      }

      // Update the interface only after the URL has been saved.
      const oldResumeUrl = resumeUrl;
      setResumeUrl(newResumeUrl);

      toast({
        title: "Resume uploaded",
        description: "Your new resume has been saved successfully.",
      });

      // Remove the old file after the new one and its URL are saved.
      if (oldResumeUrl) {
        try {
          const oldUrl = new URL(oldResumeUrl);
          const marker = `/storage/v1/object/public/${bucketName}/`;

          if (oldUrl.pathname.includes(marker)) {
            const oldPath = decodeURIComponent(
              oldUrl.pathname.split(marker)[1]
            );

            if (oldPath && oldPath !== uploadData.path) {
              const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([oldPath]);

              if (deleteError) {
                console.error(
                  "Could not delete old resume:",
                  deleteError
                );
              }
            }
          }
        } catch (cleanupError) {
          console.error("Old resume cleanup failed:", cleanupError);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      console.error("Resume upload process failed:", error);

      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });

      // Preserve the existing resume URL if an operation failed.
      // If the file uploaded but saving its URL failed, keep the
      // uploaded file so it can be inspected in Storage.
      console.log("Uploaded file path for debugging:", uploadedPath);
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleDelete = async () => {
    if (!resumeUrl) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete the resume?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      // Clear the database setting first.
      const { data: rows, error: dbError } = await supabase
        .from("site_settings")
        .update({ value: "" })
        .eq("key", "resume_url")
        .select("key");

      if (dbError) throw dbError;

      if (!rows || rows.length === 0) {
        throw new Error(
          "No resume_url row was updated. Check your database policies."
        );
      }

      setResumeUrl(null);

      // Delete the file from Storage.
      try {
        const oldUrl = new URL(resumeUrl);
        const marker = `/storage/v1/object/public/${bucketName}/`;

        if (oldUrl.pathname.includes(marker)) {
          const oldPath = decodeURIComponent(
            oldUrl.pathname.split(marker)[1]
          );

          if (oldPath) {
            const { error: storageError } = await supabase.storage
              .from(bucketName)
              .remove([oldPath]);

            if (storageError) {
              console.error(
                "Database cleared but file deletion failed:",
                storageError
              );

              toast({
                title: "Resume link removed",
                description:
                  "The database was updated, but the Storage file could not be deleted.",
                variant: "destructive",
              });

              return;
            }
          }
        }
      } catch (storageError) {
        console.error("Storage deletion failed:", storageError);
      }

      toast({
        title: "Resume deleted",
        description: "The saved resume has been removed.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      console.error("Resume deletion failed:", error);

      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Resume</h1>

      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-8"
        >
          {loading ? (
            <p className="text-muted-foreground">
              Loading resume...
            </p>
          ) : resumeUrl ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Resume Uploaded
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your resume URL is saved.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button asChild>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Resume
                  </a>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting || uploading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  Upload a new version:
                </p>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading || deleting}
                  className="text-sm"
                />

                {uploading && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Uploading resume...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                No Resume Uploaded
              </h3>

              <p className="mb-6 text-muted-foreground">
                Upload your resume in PDF format.
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading || deleting}
                  className="hidden"
                />

                <Button asChild disabled={uploading || deleting}>
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
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
