import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";
import { Button } from "./ui/button";

const normalizeExternalUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  stars?: number;
  forks?: number;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  index: number;
  is_featured: boolean;
}

export function ProjectCard({
  title,
  description,
  tags,
  stars,
  forks,
  demoUrl,
  githubUrl,
  imageUrl,
  index,
  is_featured,
}: ProjectCardProps) {
  const safeGithubUrl = githubUrl ? normalizeExternalUrl(githubUrl) : "";
  const safeDemoUrl = demoUrl ? normalizeExternalUrl(demoUrl) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card card-shine"
    >
      {/* Image */}
      {imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {title}
          </h3>
          {(stars !== undefined || forks !== undefined) && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {stars !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {stars}
                </span>
              )}
              {forks !== undefined && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  {forks}
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="tech-badge">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {safeGithubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={safeGithubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                Code
              </a>
            </Button>
          )}
          {safeDemoUrl && (
            <Button variant="default" size="sm" asChild>
              <a href={safeDemoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Demo
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-xl border border-primary/30" />
      </div>
    </motion.div>
  );
}
