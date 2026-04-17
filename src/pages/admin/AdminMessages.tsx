import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailOpen, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: !isRead })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Message deleted" });
      fetchMessages();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No messages yet.
          </div>
        ) : (
          messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-xl border bg-card ${
                msg.is_read ? "border-border" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    msg.is_read ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {msg.is_read ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Mail className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{msg.name}</h3>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {msg.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRead(msg.id, msg.is_read ?? false)}
                    title={msg.is_read ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.is_read ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <MailOpen className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <p className="text-foreground whitespace-pre-wrap mb-4">{msg.message}</p>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(msg.created_at)}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
