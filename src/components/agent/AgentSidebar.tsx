import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import SharedSidebar from "@/components/layout/SharedSidebar";

interface AgentSidebarProps {
  onDialerToggle?: () => void;
}

export default function AgentSidebar({ onDialerToggle }: AgentSidebarProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn("shrink-0 border-r border-border flex flex-col h-full transition-all duration-200", collapsed ? "w-14" : "w-56")}>
      <SharedSidebar title="Agent" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} isMobile={isMobile} />
    </aside>
  );
}
