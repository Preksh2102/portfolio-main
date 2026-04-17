import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Github, Linkedin, BookOpen, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Settings {
  github_url: string;
  linkedin_url: string;
  scholar_url: string;
  email: string;
  location: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    github_url: "https://github.com/Preksh2102",
    linkedin_url: "https://linkedin.com",
    scholar_url: "https://scholar.google.com",
    email: "prekshgala@gmail.com",
    location: "Dubai, UAE",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value");

    if (data) {
      const settingsObj: any = { ...settings };
      data.forEach((item) => {
        if (item.key in settingsObj) {
          settingsObj[item.key] = item.value || settingsObj[item.key];
        }
      });
      setSettings(settingsObj);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save to database
    const { error } = await supabase.from("contact_submissions").insert({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    }

    setIsSubmitting(false);
  };

  const socialLinks = [
    { icon: Github, label: "GitHub", href: settings.github_url, username: "@Preksh2102" },
    { icon: Linkedin, label: "LinkedIn", href: settings.linkedin_url, username: "Your Name" },
    { icon: BookOpen, label: "Google Scholar", href: settings.scholar_url, username: "View Profile" },
    { icon: Mail, label: "Email", href: `mailto:${"prekshgala@gmail.com"}`, username: "prekshgala@gmail.com" },
  ];

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
            <Mail className="w-4 h-4" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contact <span className="text-primary">Me</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Have a project in mind or want to collaborate on research?
            I'd love to hear from you.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project or inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">
                    {"Dubai, UAE"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Response Time</div>
                  <div className="text-sm text-muted-foreground">
                    Within 24-48 hours
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Me</h3>
              <div className="grid gap-3">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{link.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {link.username}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
