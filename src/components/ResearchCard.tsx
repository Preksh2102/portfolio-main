import { motion } from "framer-motion";
import { FileText, Download, Calendar, Tag } from "lucide-react";
import { Button } from "./ui/button";

interface ResearchCardProps {
  title: string;
  abstract: string;
  field: string;
  date: string;
  pdfUrl?: string;
  index: number;
}

export function ResearchCard({
  title,
  abstract,
  field,
  date,
  pdfUrl,
  index,
}: ResearchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 card-shine"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <FileText className="w-6 h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {title}
      </h3>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {abstract}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Tag className="w-4 h-4" />
          {field}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {date}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Read More
        </Button>
        {pdfUrl && (
          <Button variant="default" size="sm" asChild>
            <a href={pdfUrl} download>
              <Download className="w-4 h-4" />
              PDF
            </a>
          </Button>
        )}
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl border border-primary/30" />
      </div>
    </motion.div>
  );
}
