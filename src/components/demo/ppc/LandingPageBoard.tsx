import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
 Play, Pause, Trash2, Edit3, Eye, TrendingUp,
 DollarSign, Users, Target, Plus, ExternalLink,
 BarChart3, Globe, MoreHorizontal, Share2, X, CheckSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LandingPage } from "./types";
 
export const INITIAL_MOCK_PAGES: LandingPage[] = [
  {
    id: '1',
    name: 'AI Moving Quote - California',
    template: 'Quote Funnel',
    status: 'active',
    dailyBudget: 150,
    totalSpend: 2847,
    conversions: 234,
    conversionRate: 8.2,
    cpa: 12.17,
    trend: 'up',
    url: 'trumove.com/quote-ca',
    createdAt: '2025-01-15',
    performance: 'excellent',
    customDomain: 'moves.trumove.com',
    domainStatus: 'active'
  },
  {
    id: '2',
    name: 'Cost Calculator - Texas',
    template: 'Calculator',
    status: 'active',
    dailyBudget: 100,
    totalSpend: 1923,
    conversions: 145,
    conversionRate: 7.5,
    cpa: 13.26,
    trend: 'stable',
    url: 'trumove.com/calc-tx',
    createdAt: '2025-01-20',
    performance: 'good',
    customDomain: null,
    domainStatus: null
  },
  {
    id: '3',
    name: 'Comparison Page - National',
    template: 'Comparison',
    status: 'paused',
    dailyBudget: 75,
    totalSpend: 892,
    conversions: 42,
    conversionRate: 4.7,
    cpa: 21.24,
    trend: 'down',
    url: 'trumove.com/compare',
    createdAt: '2025-01-10',
    performance: 'poor',
    customDomain: null,
    domainStatus: null
  },
  {
    id: '4',
    name: 'Testimonial Focus - Florida',
    template: 'Testimonial',
    status: 'active',
    dailyBudget: 80,
    totalSpend: 567,
    conversions: 38,
    conversionRate: 6.7,
    cpa: 14.92,
    trend: 'up',
    url: 'trumove.com/reviews-fl',
    createdAt: '2025-01-28',
    performance: 'new',
    customDomain: null,
    domainStatus: null
  },
];
 
 interface LandingPageBoardProps {
   onCreateNew: () => void;
   onEditPage: (pageId: string) => void;
  pages: LandingPage[];
  onPagesChange: (pages: LandingPage[]) => void;
 }
 
export function LandingPageBoard({ onCreateNew, onEditPage, pages, onPagesChange }: LandingPageBoardProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const totalSpend = pages.reduce((sum, p) => sum + p.totalSpend, 0);
  const totalConversions = pages.reduce((sum, p) => sum + p.conversions, 0);
  const activePages = pages.filter(p => p.status === 'active').length;
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(pages.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const bulkSetStatus = (status: 'active' | 'paused') => {
    const count = selectedIds.size;
    onPagesChange(pages.map(p => selectedIds.has(p.id) ? { ...p, status } : p));
    toast.success(`${count} page${count > 1 ? 's' : ''} ${status === 'active' ? 'activated' : 'paused'}`);
    clearSelection();
  };

  const bulkDelete = () => {
    const count = selectedIds.size;
    onPagesChange(pages.filter(p => !selectedIds.has(p.id)));
    toast.success(`${count} page${count > 1 ? 's' : ''} deleted`);
    clearSelection();
  };
 
  const toggleStatus = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    const newStatus: 'active' | 'paused' = page.status === 'active' ? 'paused' : 'active';
    onPagesChange(pages.map(p => p.id === id ? { ...p, status: newStatus } : p));
    toast.success(`Page ${newStatus === 'active' ? 'activated' : 'paused'}`, { description: page.name });
  };
 
  const deletePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    onPagesChange(pages.filter(p => p.id !== id));
    toast.success('Page deleted', { description: page?.name });
  };
 
  const getPerformanceStyles = (perf: LandingPage['performance']) => {
    switch (perf) {
      case 'excellent': return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' };
      case 'good': return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' };
      case 'poor': return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' };
      case 'new': return { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
    }
  };

  const hasSelection = selectedIds.size > 0;
 
  return (
    <div className="space-y-5">
      {/* Compact Stats Row */}
      <div className="flex items-center gap-6 p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">${totalSpend.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total Spend</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totalConversions}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Conversions</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">${avgCPA.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Avg CPA</p>
          </div>
        </div>
        <div className="flex-1" />
        <Badge variant="secondary" className="gap-1">
          <Play className="w-3 h-3" />
          {activePages} Active
        </Badge>
       </div>
 
      {/* Header with Create Button & Bulk Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Your Landing Pages</h3>
          {!hasSelection && pages.length > 1 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={selectAll}>
              <CheckSquare className="w-3 h-3" /> Select All
            </Button>
          )}
        </div>
        
        {hasSelection ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {selectedIds.size} selected
            </Badge>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => bulkSetStatus('active')}>
              <Play className="w-3 h-3" /> Activate
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => bulkSetStatus('paused')}>
              <Pause className="w-3 h-3" /> Pause
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={bulkDelete}>
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearSelection}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onCreateNew} 
            size="sm" 
            className="gap-1.5"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
          >
            <Plus className="w-4 h-4" /> Create New
          </Button>
        )}
      </div>
 
      {/* Simplified Card-Based Pages List */}
      <ScrollArea className="h-[380px]">
        <div className="grid grid-cols-2 gap-3">
          {pages.map((page) => {
            const perfStyles = getPerformanceStyles(page.performance);
            return (
              <Card 
                key={page.id} 
                className={`group transition-all hover:shadow-md ${page.status === 'paused' ? 'opacity-70' : ''} ${perfStyles.border} ${selectedIds.has(page.id) ? 'ring-2 ring-primary/50' : ''}`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Checkbox 
                        checked={selectedIds.has(page.id)}
                        onCheckedChange={() => toggleSelection(page.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{page.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px]">{page.template}</Badge>
                          <Badge 
                            className={`text-[10px] ${perfStyles.bg} ${perfStyles.text}`}
                          >
                            {page.performance}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={page.status === 'active' ? 'default' : 'secondary'} 
                      className="gap-1 text-[10px] shrink-0"
                    >
                      {page.status === 'active' ? <Play className="w-2 h-2" /> : <Pause className="w-2 h-2" />}
                      {page.status}
                    </Badge>
                  </div>
 
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Conversions</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        {page.conversions}
                        {page.trend === 'up' && <TrendingUp className="w-3 h-3 text-blue-500" />}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost/Lead</p>
                      <p className={`font-semibold ${page.cpa < 15 ? 'text-blue-600' : page.cpa > 20 ? 'text-red-500' : 'text-foreground'}`}>
                        ${page.cpa.toFixed(2)}
                      </p>
                    </div>
                  </div>
 
                  {/* URL & Domain */}
                  <div className="flex items-center gap-2 text-xs">
                    <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-primary truncate">
                      {page.url} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                    {page.customDomain && (
                      <>
                        <span className="text-muted-foreground/50">•</span>
                        <div className="flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-primary" />
                          <span className="text-primary text-[10px]">{page.customDomain}</span>
                        </div>
                      </>
                    )}
                  </div>
 
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 gap-1 text-xs"
                      onClick={() => onEditPage(page.id)}
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleStatus(page.id)}
                    >
                      {page.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => deletePage(page.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
 }