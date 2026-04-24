import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  site_name: string;
  tagline: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  scholar_url: string;
  email: string;
  location: string;
}

const defaultSettings: Settings = {
  site_name: "",
  tagline: "",
  bio: "",
  github_url: "",
  linkedin_url: "",
  scholar_url: "",
  email: "",
  location: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data) {
      const settingsObj = { ...defaultSettings };
      data.forEach((item) => {
        if (item.key in settingsObj) {
          (settingsObj as any)[item.key] = item.value || "";
        }
      });
      setSettings(settingsObj);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").update({ value }).eq("key", key)
    );

    await Promise.all(updates);

    toast({ title: "Success", description: "Settings saved" });
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <Button variant="default" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-border bg-card"
        >
          <h2 className="text-xl font-semibold mb-6">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="Preksh's Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <Input
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="AI Developer | Machine Learning Researcher"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                rows={4}
                placeholder="A short bio about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-border bg-card"
        >
          <h2 className="text-xl font-semibold mb-6">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <Input
                type="url"
                value={settings.github_url}
                onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <Input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Scholar URL</label>
              <Input
                type="url"
                value={settings.scholar_url}
                onChange={(e) => setSettings({ ...settings, scholar_url: e.target.value })}
                placeholder="https://scholar.google.com/citations?user=..."
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
