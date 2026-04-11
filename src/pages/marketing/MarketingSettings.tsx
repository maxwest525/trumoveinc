import MarketingShell from "@/components/layout/MarketingShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Plug, Mail, Users } from "lucide-react";
import IntegrationsContent from "@/components/marketing/settings/IntegrationsContent";
import TemplatesContent from "@/components/marketing/settings/TemplatesContent";

export default function MarketingSettings() {
  return (
    <MarketingShell breadcrumb="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Integrations, templates & team settings
          </p>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="integrations">
              <Plug className="w-3.5 h-3.5 mr-1.5" />Integrations
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Mail className="w-3.5 h-3.5 mr-1.5" />Email & SMS
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-3.5 h-3.5 mr-1.5" />Team & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <IntegrationsContent />
          </TabsContent>
          <TabsContent value="templates">
            <TemplatesContent />
          </TabsContent>
          <TabsContent value="team">
            <div className="mt-4">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Team & Permissions</p>
                  <p className="text-xs mt-1">Manage marketing team roles and access controls. Coming soon.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MarketingShell>
  );
}
