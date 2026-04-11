import { useState } from "react";
import { ArrowLeft, Home, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SiteBuilderTab from "@/components/creative/SiteBuilderTab";
import MediaLibraryTab from "@/components/creative/MediaLibraryTab";
import AIImageGeneratorTab from "@/components/creative/AIImageGeneratorTab";
import TemplatesTab from "@/components/creative/TemplatesTab";

export default function CreativeStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("site-builder");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 h-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-semibold">Creative Studio</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-1 px-4 py-4 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="site-builder" className="text-xs">Site Builder</TabsTrigger>
            <TabsTrigger value="media-library" className="text-xs">Media Library</TabsTrigger>
            <TabsTrigger value="ai-images" className="text-xs">AI Image Generator</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="site-builder"><SiteBuilderTab /></TabsContent>
          <TabsContent value="media-library"><MediaLibraryTab /></TabsContent>
          <TabsContent value="ai-images"><AIImageGeneratorTab /></TabsContent>
          <TabsContent value="templates"><TemplatesTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
