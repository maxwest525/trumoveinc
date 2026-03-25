import MarketingShell from "@/components/layout/MarketingShell";
import {
  ListTodo, CheckCircle2, Clock, Circle, Search, Megaphone,
  Globe, Filter, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TaskStatus = "all" | "in_progress" | "done" | "queued";

const TASKS = [
  { id: 1, agent: "SEO", text: "Generate keyword cluster for 'long distance movers'", status: "done", time: "2m ago", priority: "high" },
  { id: 2, agent: "Ads", text: "Pause underperforming ad group 'movers near me'", status: "done", time: "15m ago", priority: "high" },
  { id: 3, agent: "SEO", text: "Technical SEO audit — fix broken links", status: "done", time: "1h ago", priority: "medium" },
  { id: 4, agent: "Ads", text: "Create new responsive search ad variants", status: "done", time: "2h ago", priority: "medium" },
  { id: 5, agent: "Website", text: "Optimize hero section load time", status: "in_progress", time: "Started 3h ago", priority: "medium" },
  { id: 6, agent: "SEO", text: "Build backlink outreach list for Q2", status: "in_progress", time: "Started 4h ago", priority: "medium" },
  { id: 7, agent: "Ads", text: "Scale Meta LAL campaign budget by 20%", status: "in_progress", time: "Started 5h ago", priority: "low" },
  { id: 8, agent: "SEO", text: "Write blog post: 'Moving Cost Calculator Guide'", status: "in_progress", time: "Started 6h ago", priority: "high" },
  { id: 9, agent: "Website", text: "Add exit-intent popup with seasonal offer", status: "queued", time: "Queued", priority: "low" },
  { id: 10, agent: "SEO", text: "Research State-by-State Moving Regulations content", status: "queued", time: "Queued", priority: "medium" },
  { id: 11, agent: "Ads", text: "Test new YouTube discovery campaign", status: "queued", time: "Queued", priority: "low" },
  { id: 12, agent: "Website", text: "Redesign /online-estimate for higher conversion", status: "queued", time: "Queued", priority: "high" },
];

const agentIcon = (agent: string) => {
  if (agent === "SEO") return Search;
  if (agent === "Ads") return Megaphone;
  return Globe;
};

const agentColor = (agent: string) => {
  if (agent === "SEO") return "text-emerald-600 bg-emerald-500/10";
  if (agent === "Ads") return "text-blue-600 bg-blue-500/10";
  return "text-violet-600 bg-violet-500/10";
};

const statusIcon = (status: string) => {
  if (status === "done") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  if (status === "in_progress") return <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
  return <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />;
};

export default function MarketingTasks() {
  const [filter, setFilter] = useState<TaskStatus>("all");

  const filtered = filter === "all" ? TASKS : TASKS.filter((t) => t.status === filter);

  const counts = {
    all: TASKS.length,
    in_progress: TASKS.filter((t) => t.status === "in_progress").length,
    done: TASKS.filter((t) => t.status === "done").length,
    queued: TASKS.filter((t) => t.status === "queued").length,
  };

  return (
    <MarketingShell breadcrumb=" / Tasks">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Tasks</h1>
              <p className="text-xs text-muted-foreground">Track all tasks your AI agents are working on</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 w-fit">
          {(["all", "in_progress", "done", "queued"] as TaskStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                filter === s
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s === "done" ? "Done" : "Queued"}
              <span className="ml-1 text-[9px] opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="bg-card rounded-xl border border-border">
          <div className="divide-y divide-border/30">
            {filtered.map((task) => {
              const AgentIcon = agentIcon(task.agent);
              return (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                  {statusIcon(task.status)}
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", agentColor(task.agent))}>
                    <AgentIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-foreground">{task.text}</div>
                    <div className="text-[9px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{task.agent} Agent</span>
                      <span>·</span>
                      <span>{task.time}</span>
                      {task.priority === "high" && (
                        <>
                          <span>·</span>
                          <span className="text-red-500 font-bold uppercase text-[8px]">High Priority</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
