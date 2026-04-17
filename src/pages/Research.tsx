import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import { ResearchCard } from "@/components/ResearchCard";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Paper {
  id: string;
  title: string;
  abstract: string | null;
  field: string | null;
  published_date: string | null;
  pdf_url: string | null;
}

export default function Research() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    const { data, error } = await supabase
      .from("research_papers")
      .select("*")
      .eq("is_published", true)
      .order("published_date", { ascending: false });

    if (!error && data) {
      setPapers(data);
    }
    setLoading(false);
  };

  const filteredPapers = papers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (paper.abstract || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (paper.field || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
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
            <BookOpen className="w-4 h-4" />
            <span>Academic Publications</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Research <span className="text-primary">Papers</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            My published research in artificial intelligence, machine learning,
            and related fields. Click on any paper to read more or download.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mx-auto mb-12"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search papers by title, abstract, or field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Papers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper, index) => (
              <ResearchCard
                key={paper.id}
                title={paper.title}
                abstract={paper.abstract || ""}
                field={paper.field || ""}
                date={formatDate(paper.published_date)}
                pdfUrl={paper.pdf_url || undefined}
                index={index}
              />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              No papers yet. Add research papers from the admin panel.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              No papers found matching your search.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
