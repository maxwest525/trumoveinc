import { createContext, useContext, useState, type ReactNode } from "react";

export type ChangeStatus = "pending" | "approved" | "scheduled" | "deployed" | "rejected" | "rolled_back";
export type ChangeCategory = "seo" | "ads" | "content" | "cro" | "technical";

export interface ImplementationChange {
  id: string;
  title: string;
  description: string;
  category: ChangeCategory;
  status: ChangeStatus;
  source: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
  deployedAt?: string;
  scheduledFor?: string;
  author: string;
  diff?: string;
}

interface ImplementationQueueContextType {
  changes: ImplementationChange[];
  addChange: (change: ImplementationChange) => void;
  updateChange: (id: string, updates: Partial<ImplementationChange>) => void;
  setChanges: React.Dispatch<React.SetStateAction<ImplementationChange[]>>;
}

const ImplementationQueueContext = createContext<ImplementationQueueContextType | null>(null);

const SEED_CHANGES: ImplementationChange[] = [
  {
    id: "ch-005",
    title: "Publish refreshed 'Moving Checklist' blog post",
    description: "Updated content with 2026 data, new internal links, and refreshed images.",
    category: "content",
    status: "deployed",
    deployedAt: "2026-04-01T12:00:00Z",
    source: "Content Center",
    priority: "medium",
    createdAt: "2026-03-29T11:00:00Z",
    author: "Content AI",
  },
  {
    id: "ch-006",
    title: "Redirect /old-services to /services",
    description: "301 redirect to consolidate link equity from deprecated URL.",
    category: "technical",
    status: "deployed",
    deployedAt: "2026-03-28T09:00:00Z",
    source: "SEO Audit",
    priority: "low",
    createdAt: "2026-03-27T14:00:00Z",
    author: "Marketing Team",
  },
  {
    id: "ch-007",
    title: "Update Google Ads bid strategy to tCPA",
    description: "Switch from manual CPC to target CPA bidding at $22.",
    category: "ads",
    status: "rolled_back",
    deployedAt: "2026-03-25T10:00:00Z",
    source: "PPC Dashboard",
    priority: "high",
    createdAt: "2026-03-24T08:00:00Z",
    author: "AI Engine",
  },
];

export function ImplementationQueueProvider({ children }: { children: ReactNode }) {
  const [changes, setChanges] = useState<ImplementationChange[]>(SEED_CHANGES);

  const addChange = (change: ImplementationChange) => {
    setChanges((prev) => {
      if (prev.some((c) => c.id === change.id)) return prev;
      return [change, ...prev];
    });
  };

  const updateChange = (id: string, updates: Partial<ImplementationChange>) => {
    setChanges((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  return (
    <ImplementationQueueContext.Provider value={{ changes, addChange, updateChange, setChanges }}>
      {children}
    </ImplementationQueueContext.Provider>
  );
}

export function useImplementationQueue() {
  const ctx = useContext(ImplementationQueueContext);
  if (!ctx) throw new Error("useImplementationQueue must be used within ImplementationQueueProvider");
  return ctx;
}
