import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Resume() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            <span>Professional Profile</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            My <span className="text-primary">Resume</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Download my latest resume or view it inline below.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : resumeUrl ? (
          <>
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button variant="hero" size="lg" asChild>
                <a href={resumeUrl} download>
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5" />
                  Open in New Tab
                </a>
              </Button>
            </motion.div>

            {/* Resume Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Preview Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Resume Preview</span>
                </div>

                {/* PDF Preview */}
                <div className="aspect-[8.5/11] bg-card">
                  <iframe
                    src={`${resumeUrl}#view=FitH`}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Resume Preview</span>
              </div>
              <div className="aspect-[8.5/11] bg-card flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Resume Coming Soon</h3>
                  <p className="text-muted-foreground">
                    The resume will be available for download shortly.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            Quick <span className="text-primary">Overview</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Education",
                items: ["B.S. Computer Science", "Focus: AI & ML", "GPA: 4.0"],
              },
              {
                title: "Skills",
                items: ["Python, PyTorch, TensorFlow", "Computer Vision, NLP", "Full-Stack Development"],
              },
              {
                title: "Experience",
                items: ["AI Research Intern", "ML Engineering Projects", "Open Source Contributions"],
              },
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <h3 className="font-semibold text-lg mb-4 text-primary">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-muted-foreground text-sm flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
