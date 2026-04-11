import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Plus, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function TemplatesContent() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["message-templates"],
    queryFn: async () => {
      const { data } = await supabase.from("message_templates").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Email and SMS templates for marketing automation.</p>
        <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />New Template</Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No templates yet</p>
            <p className="text-xs mt-1">Create email and SMS templates for your marketing campaigns.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {templates.map((t: any) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              {t.channel === "email" ? <Mail className="w-4 h-4 text-blue-500 shrink-0" /> : <MessageSquare className="w-4 h-4 text-green-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                {t.subject && <p className="text-xs text-muted-foreground truncate">{t.subject}</p>}
              </div>
              <Badge variant="outline" className="text-[10px]">{t.channel}</Badge>
              <Button size="sm" variant="ghost" className="h-7 text-xs">Edit</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
