import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, Phone, Search, Users, BarChart3, ListChecks, Inbox, ChevronDown, PhoneCall, PhoneOff, Pause, ArrowRightLeft } from "lucide-react";

interface AgentToolWorkspaceProps {
  open: boolean;
  onClose: () => void;
}

const MOCK_LEADS = [
  { name: "Sarah Johnson", phone: "(305) 555-0142", status: "New", date: "03/18/2026" },
  { name: "Mike Torres", phone: "(786) 555-0298", status: "Contacted", date: "03/17/2026" },
  { name: "Emily Chen", phone: "(954) 555-0173", status: "Qualified", date: "03/17/2026" },
  { name: "David Kim", phone: "(407) 555-0385", status: "Estimate Sent", date: "03/16/2026" },
  { name: "Lisa Rodriguez", phone: "(561) 555-0421", status: "Follow Up", date: "03/16/2026" },
  { name: "James Wilson", phone: "(321) 555-0567", status: "New", date: "03/15/2026" },
  { name: "Anna Petrov", phone: "(239) 555-0834", status: "Booked", date: "03/15/2026" },
  { name: "Carlos Mendez", phone: "(727) 555-0192", status: "Contacted", date: "03/14/2026" },
];

const CALL_QUEUE = [
  { name: "Sarah Johnson", phone: "(305) 555-0142", priority: "high" },
  { name: "Mike Torres", phone: "(786) 555-0298", priority: "medium" },
  { name: "Emily Chen", phone: "(954) 555-0173", priority: "low" },
  { name: "David Kim", phone: "(407) 555-0385", priority: "medium" },
];

const DIAL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-400",
  Contacted: "bg-amber-500/20 text-amber-400",
  Qualified: "bg-emerald-500/20 text-emerald-400",
  "Estimate Sent": "bg-purple-500/20 text-purple-400",
  "Follow Up": "bg-orange-500/20 text-orange-400",
  Booked: "bg-green-500/20 text-green-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
};

function GranotPanel() {
  return (
    <div className="flex h-full bg-[#0f1117] text-gray-200">
      {/* Sidebar */}
      <div className="w-48 bg-[#0a0c10] border-r border-white/5 flex flex-col">
        <div className="px-4 py-4 border-b border-white/5">
          <span className="text-sm font-bold tracking-wide text-white">GRANOT</span>
          <span className="text-[10px] text-gray-500 ml-1.5">CRM</span>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {[
            { icon: Inbox, label: "Dashboard" },
            { icon: Users, label: "Contacts", active: true },
            { icon: BarChart3, label: "Pipeline" },
            { icon: ListChecks, label: "Tasks" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-default transition-colors ${
                item.active ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center text-[10px] font-bold text-blue-400">A</div>
            <span className="text-[11px] text-gray-400 truncate">Agent User</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-11 border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">Search contacts...</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-gray-500">8 contacts</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/5">
                <th className="text-left pb-2.5 font-medium">Name</th>
                <th className="text-left pb-2.5 font-medium">Phone</th>
                <th className="text-left pb-2.5 font-medium">Status</th>
                <th className="text-left pb-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-default">
                  <td className="py-2.5 text-xs font-medium text-gray-200">{lead.name}</td>
                  <td className="py-2.5 text-xs text-gray-400 font-mono">{lead.phone}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || ""}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-gray-500">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConvosoPanel() {
  return (
    <div className="flex h-full bg-[#0d1018] text-gray-200">
      {/* Call queue sidebar */}
      <div className="w-56 bg-[#080b12] border-r border-white/5 flex flex-col">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">Call Queue</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">{CALL_QUEUE.length}</span>
        </div>
        <div className="flex-1 overflow-auto py-2 px-2 space-y-1.5">
          {CALL_QUEUE.map((item, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg px-3 py-2.5 hover:bg-white/[0.06] transition-colors cursor-default">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-200 truncate">{item.name}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[item.priority]}`}>
                  {item.priority}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">{item.phone}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main dialer area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0">
        {/* Agent status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Available</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </div>

        {/* Phone number display */}
        <div className="text-center">
          <div className="text-2xl font-mono font-light text-gray-300 tracking-widest mb-1">
            (___) ___-____
          </div>
          <span className="text-[10px] text-gray-600">Enter number or select from queue</span>
        </div>

        {/* Dial pad */}
        <div className="grid grid-cols-3 gap-2">
          {DIAL_KEYS.map((key) => (
            <div
              key={key}
              className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg font-medium text-gray-300 hover:bg-white/[0.08] transition-colors cursor-default select-none"
            >
              {key}
            </div>
          ))}
        </div>

        {/* Call controls */}
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-600/30 transition-colors cursor-default">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors cursor-default">
            <Pause className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors cursor-default">
            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center hover:bg-red-600/30 transition-colors cursor-default">
            <PhoneOff className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentToolWorkspace({ open, onClose }: AgentToolWorkspaceProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-[#080a0f]"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Top bar */}
          <div className="h-10 bg-[#060810] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-gray-300">Granot CRM</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-300">Convoso Dialer</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
              Exit Workspace
            </button>
          </div>

          {/* Panels */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 border-r border-white/5">
              <GranotPanel />
            </div>
            <div className="flex-1">
              <ConvosoPanel />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
