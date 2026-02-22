import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, CheckCircle2, AlertCircle, Clock, 
  TrendingUp, TrendingDown, Minus, Link2, Unlink,
  ChevronDown, ChevronUp, Zap, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";

interface ConnectedAccount {
  id: string;
  platform: string;
  icon: string;
  color: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSync: Date | null;
  metrics?: {
    spend: number;
    clicks: number;
    conversions: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface ConnectedAccountsPanelProps {
  compact?: boolean;
  liveMode?: boolean;
}

const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'google',
    platform: 'Google Ads',
    icon: '🔍',
    color: '#4285F4',
    status: 'connected',
    lastSync: new Date(Date.now() - 120000), // 2 min ago
    metrics: { spend: 1247.80, clicks: 3421, conversions: 89, trend: 'up' }
  },
  {
    id: 'meta',
    platform: 'Meta Business',
    icon: '📘',
    color: '#0668E1',
    status: 'connected',
    lastSync: new Date(Date.now() - 300000), // 5 min ago
    metrics: { spend: 892.40, clicks: 2156, conversions: 67, trend: 'up' }
  },
  {
    id: 'tiktok',
    platform: 'TikTok Ads',
    icon: '🎵',
    color: '#000000',
    status: 'disconnected',
    lastSync: null,
    metrics: undefined
  },
  {
    id: 'microsoft',
    platform: 'Microsoft Ads',
    icon: '🪟',
    color: '#00A4EF',
    status: 'disconnected',
    lastSync: null,
    metrics: undefined
  },
];

export function ConnectedAccountsPanel({ compact = false, liveMode = false }: ConnectedAccountsPanelProps) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(INITIAL_ACCOUNTS);
  const [expanded, setExpanded] = useState(!compact);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Live mode - simulate real-time sync
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      setAccounts(prev => prev.map(acc => {
        if (acc.status !== 'connected' || !acc.metrics) return acc;
        
        // Simulate small metric changes
        const spendDelta = Math.random() * 2;
        const clicksDelta = Math.floor(Math.random() * 3);
        const convDelta = Math.random() > 0.9 ? 1 : 0;
        
        return {
          ...acc,
          lastSync: new Date(),
          metrics: {
            spend: acc.metrics.spend + spendDelta,
            clicks: acc.metrics.clicks + clicksDelta,
            conversions: acc.metrics.conversions + convDelta,
            trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down'
          }
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId);
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, status: 'syncing' as const } : acc
    ));

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, status: 'connected' as const, lastSync: new Date() } : acc
    ));
    setSyncingId(null);
    toast.success(`${accounts.find(a => a.id === accountId)?.platform} synced!`);
  };

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    
    // Only Google has real OAuth integration in Lovable Cloud
    if (accountId === 'google') {
      setConnectingId(accountId);
      try {
        const { error } = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        
        if (error) {
          toast.error("Failed to connect Google Ads", {
            description: error.message
          });
        } else {
          // Update account status on success
          setAccounts(prev => prev.map(acc => 
            acc.id === accountId 
              ? { 
                  ...acc, 
                  status: 'connected' as const, 
                  lastSync: new Date(),
                  metrics: { spend: 0, clicks: 0, conversions: 0, trend: 'stable' as const }
                } 
              : acc
          ));
          toast.success(`${account?.platform} connected successfully!`);
        }
      } catch (err) {
        toast.error("Connection failed", {
          description: "Please try again"
        });
      } finally {
        setConnectingId(null);
      }
    } else {
      // Other platforms show demo message (Meta OAuth not supported in Lovable Cloud)
      toast.info(`Connect to ${account?.platform}`, {
        description: accountId === 'meta' 
          ? 'Meta OAuth integration coming soon. Using demo mode.'
          : 'This would open OAuth flow in production'
      });
      
      // Simulate connection for demo
      setConnectingId(accountId);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { 
              ...acc, 
              status: 'connected' as const, 
              lastSync: new Date(),
              metrics: { spend: 0, clicks: 0, conversions: 0, trend: 'stable' as const }
            } 
          : acc
      ));
      setConnectingId(null);
      toast.success(`${account?.platform} connected (demo mode)`);
    }
  };

  const getTimeSince = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-blue-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const connectedCount = accounts.filter(a => a.status === 'connected').length;

  // Compact view - just status badges
  if (compact && !expanded) {
    return (
      <div 
        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-1">
          {accounts.filter(a => a.status === 'connected').map(acc => (
            <div 
              key={acc.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: `${acc.color}20` }}
              title={acc.platform}
            >
              {acc.icon}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">
            {connectedCount} connected
          </span>
        </div>
        {liveMode && (
           <Badge variant="outline" className="text-[10px] gap-1 h-5 border-blue-500/50">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live
          </Badge>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border border-border overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border cursor-pointer"
        onClick={() => compact && setExpanded(false)}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Connected Accounts</span>
          <Badge variant="secondary" className="text-[10px] h-5">
            {connectedCount}/{accounts.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {liveMode && (
             <Badge className="text-[10px] gap-1 h-5 bg-blue-500/10 text-blue-600 border-blue-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Sync
            </Badge>
          )}
          {compact && <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="p-3 space-y-2">
        {accounts.map((account) => (
          <div 
            key={account.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              account.status === 'connected' 
                ? "bg-card border-border hover:border-primary/30" 
                : "bg-muted/30 border-dashed border-border/50"
            )}
          >
            {/* Platform Icon */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ background: `${account.color}15` }}
            >
              {account.icon}
            </div>

            {/* Platform Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">{account.platform}</span>
                {account.status === 'connected' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                )}
                {account.status === 'syncing' && (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                )}
                {account.status === 'error' && (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>
              
              {account.status === 'connected' && account.lastSync && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    Synced {getTimeSince(account.lastSync)}
                  </span>
                </div>
              )}
              
              {account.status === 'disconnected' && (
                <span className="text-[10px] text-muted-foreground">Not connected</span>
              )}
            </div>

            {/* Metrics (if connected) */}
            {account.status === 'connected' && account.metrics && (
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <div className="text-right">
                  <div className={cn("font-semibold text-foreground", liveMode && "transition-all duration-300")}>
                    ${account.metrics.spend.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">spend</div>
                </div>
                <div className="text-right">
                  <div className={cn("font-semibold text-foreground", liveMode && "transition-all duration-300")}>
                    {account.metrics.clicks.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">clicks</div>
                </div>
                <div className="text-right flex items-center gap-1">
                  <div>
                    <div className={cn("font-semibold text-foreground", liveMode && "transition-all duration-300")}>
                      {account.metrics.conversions}
                    </div>
                    <div className="text-[10px] text-muted-foreground">conv</div>
                  </div>
                  <TrendIcon trend={account.metrics.trend} />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="shrink-0">
              {account.status === 'connected' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleSync(account.id)}
                  disabled={syncingId === account.id}
                >
                  <RefreshCw className={cn("w-4 h-4", syncingId === account.id && "animate-spin")} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => handleConnect(account.id)}
                  disabled={connectingId === account.id}
                >
                  {connectingId === account.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Link2 className="w-3 h-3" />
                  )}
                  {connectingId === account.id ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {liveMode 
            ? "📡 Data syncing in real-time" 
            : "Connect accounts to import live campaign data"
          }
        </p>
      </div>
    </Card>
  );
}
