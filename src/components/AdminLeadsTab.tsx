import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  Download, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { InquiryLead, LeadStatus } from '../types';

interface AdminLeadsTabProps {
  leads: InquiryLead[];
  onRefreshLeads: () => void;
  onUpdateLeadStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  isLoading?: boolean;
  studioConnected?: boolean;
  onSyncStudio?: () => Promise<void>;
  isStudioSyncing?: boolean;
  lastStudioSync?: string | null;
  realtimeSyncEnabled?: boolean;
  onToggleRealtimeSync?: () => void;
}

export const AdminLeadsTab: React.FC<AdminLeadsTabProps> = ({
  leads,
  onRefreshLeads,
  onUpdateLeadStatus,
  onDeleteLead,
  isLoading = false,
  studioConnected = true,
  onSyncStudio,
  isStudioSyncing = false,
  lastStudioSync,
  realtimeSyncEnabled = true,
  onToggleRealtimeSync,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | LeadStatus>('all');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusUpdateSuccessId, setStatusUpdateSuccessId] = useState<string | null>(null);

  // Filter leads based on status and search query
  const pendingLeadsCount = leads.filter((l) => l.status === 'new' || l.status === 'reviewing').length;

  const filteredLeads = leads.filter((lead) => {
    let matchesFilter = false;
    if (selectedFilter === 'all') {
      matchesFilter = true;
    } else if (selectedFilter === 'pending') {
      matchesFilter = lead.status === 'new' || lead.status === 'reviewing';
    } else {
      matchesFilter = lead.status === selectedFilter;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesFilter;

    const matchesSearch =
      lead.fullName.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.organization && lead.organization.toLowerCase().includes(q)) ||
      (lead.serviceCategory && lead.serviceCategory.toLowerCase().includes(q)) ||
      (lead.phone && lead.phone.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setUpdatingId(id);
    await onUpdateLeadStatus(id, newStatus);
    setUpdatingId(null);
    setStatusUpdateSuccessId(id);
    setTimeout(() => {
      setStatusUpdateSuccessId(null);
    }, 2500);
  };

  const handleSaveNotes = async (id: string) => {
    setUpdatingId(id);
    await onUpdateLeadStatus(id, leads.find((l) => l.id === id)?.status || 'new', noteText);
    setEditingNotesId(null);
    setUpdatingId(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Lead ID',
      'Full Name',
      'Email',
      'Phone',
      'Organization',
      'Industry',
      'Service Track',
      'Budget',
      'Timeline',
      'Billing',
      'Status',
      'Submitted At',
      'Message',
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ''}"`,
      `"${(l.organization || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.serviceCategory || '').replace(/"/g, '""')}"`,
      `"${(l.budgetRange || '').replace(/"/g, '""')}"`,
      `"${l.timeline || ''}"`,
      `"${l.billingPreference || ''}"`,
      `"${l.status}"`,
      `"${l.submittedAt}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nepalai_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'reviewing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'contacted':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'converted':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'archived':
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Studio Real-Time Bridge Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <span>studio.nepalai.tech/admin Live Bridge</span>
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-Time Synced
              </span>
            </span>
            <span className="text-indigo-300/80">
              Direct connection to sovereign studio admin console. Status updates on pending inquiries synchronize instantly.
              {lastStudioSync && <span className="ml-1 font-mono text-[10px] text-indigo-400">Last sync: {lastStudioSync}</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleRealtimeSync && (
            <button
              type="button"
              onClick={onToggleRealtimeSync}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                realtimeSyncEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle 10s Real-Time Polling"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${realtimeSyncEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{realtimeSyncEnabled ? 'Auto-Sync: ON (10s)' : 'Auto-Sync: PAUSED'}</span>
            </button>
          )}

          {onSyncStudio && (
            <button
              type="button"
              onClick={onSyncStudio}
              disabled={isStudioSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync Pending Leads with Studio"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isStudioSyncing ? 'animate-spin' : ''}`} />
              <span>{isStudioSyncing ? 'Syncing...' : 'Sync Studio'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Notification Banner: Protected Server Dispatch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Protected Server Mail Notification Active</span>
            <span className="text-emerald-300/80">
              Inquiries submitted through the landing page are dispatched server-side to the administrator and recorded securely in the database.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefreshLeads}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Total Inquiries</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{leads.length}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">New Requests</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{newLeadsCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-mono">In Review</span>
          <span className="text-lg font-bold text-indigo-300 mt-0.5 block">
            {leads.filter((l) => l.status === 'reviewing' || l.status === 'contacted').length}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono">Converted</span>
          <span className="text-lg font-bold text-cyan-300 mt-0.5 block">
            {leads.filter((l) => l.status === 'converted').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, email, company, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {(['all', 'pending', 'new', 'reviewing', 'contacted', 'converted', 'archived'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap text-xs transition-colors cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {filter}
              {filter === 'pending' && pendingLeadsCount > 0 && (
                <span className="ml-1.5 px-1 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  {pendingLeadsCount}
                </span>
              )}
              {filter === 'new' && newLeadsCount > 0 && (
                <span className="ml-1.5 px-1 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                  {newLeadsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <Inbox className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Inquiries Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No inquiries match your current search query. Clear search to see all.'
                : 'Any inquiries submitted on the consultation form or contact section will appear here automatically.'}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;
            const isEditingNotes = editingNotesId === lead.id;

            return (
              <div
                key={lead.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{lead.fullName}</span>
                    {lead.organization && lead.organization !== 'N/A' && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Building className="h-3 w-3 text-slate-500" />
                        <span>{lead.organization}</span>
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {new Date(lead.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        aria-label="Change inquiry status"
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                      </select>

                      {updatingId === lead.id && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Syncing...</span>
                        </span>
                      )}

                      {statusUpdateSuccessId === lead.id && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Synced to Studio</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-emerald-400 hover:underline truncate"
                      title={`Send email to ${lead.email}`}
                    >
                      {lead.email}
                    </a>
                  </div>

                  {lead.phone && lead.phone !== 'N/A' && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-300 hover:underline truncate"
                        title="Chat on WhatsApp"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{lead.serviceCategory || 'General Inquiry'}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2 pt-3 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                    {/* Project Scope & Objectives */}
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">
                        Inquiry Scope & Project Objectives:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {lead.message}
                      </p>
                    </div>

                    {/* Metadata Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Budget Bracket</span>
                        <span className="font-semibold text-slate-200">{lead.budgetRange || 'Not Specified'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Target Timeline</span>
                        <span className="font-semibold text-slate-200">{lead.timeline || 'Flexible'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Billing Preference</span>
                        <span className="font-semibold text-slate-200">{lead.billingPreference || 'NPR (Local)'}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-slate-500 block">Source Origin</span>
                        <span className="font-semibold text-slate-200">{lead.source || 'Website Form'}</span>
                      </div>
                    </div>

                    {/* Admin Internal Notes */}
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Admin Internal Notes</span>
                        </span>
                        {!isEditingNotes && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setNoteText(lead.adminNotes || '');
                            }}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            {lead.adminNotes ? 'Edit Notes' : '+ Add Note'}
                          </button>
                        )}
                      </div>

                      {isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add notes about call summary, contract status, or engineering assignments..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingNotesId(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNotes(lead.id)}
                              className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {lead.adminNotes || 'No internal notes added yet.'}
                        </p>
                      )}
                    </div>

                    {/* Direct Contact Actions & Delete */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${lead.email}?subject=NepalAI%20Consultation%20Follow-up%20-%20${encodeURIComponent(lead.organization || lead.fullName)}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Email Client</span>
                        </a>

                        {lead.phone && lead.phone !== 'N/A' && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(lead.fullName)},%20this%20is%20NepalAI%20team%20following%20up%20on%20your%20inquiry.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete inquiry from ${lead.fullName}?`)) {
                            onDeleteLead(lead.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Lead"
                        aria-label="Delete this inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
