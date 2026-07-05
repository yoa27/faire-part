import React, { useState, useEffect } from "react";
import { RSVP } from "../types";
import { 
  Users, Mail, Clock, CheckCircle, Search, 
  Trash2, UserPlus, Upload, Send, Share2, Edit2, 
  ArrowLeft, ArrowRight, RefreshCw, Feather, Check, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GuestlistPanelProps {
  onRefreshTrigger?: number;
}

export default function GuestlistPanel({ onRefreshTrigger }: GuestlistPanelProps) {
  const [guests, setGuests] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [message, setMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load guests list from API
  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rsvp");
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (e) {
      console.error("Failed to load guests list:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [onRefreshTrigger]);

  // Compute stat counts
  const totalGuests = guests.length;
  const confirmedCount = guests.filter((g) => g.status === "confirmed").length;
  const pendingCount = guests.filter((g) => g.status === "pending").length;
  const declinedCount = guests.filter((g) => g.status === "declined").length;
  const emailsSent = guests.filter((g) => g.email).length;

  // Add individual guest manually
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone || "—",
          status: "pending",
          dietary: "None",
          plusOne: "No"
        })
      });
      if (res.ok) {
        setNewGuestName("");
        setNewGuestEmail("");
        setNewGuestPhone("");
        setShowAddModal(false);
        fetchGuests();
        showToast("Guest added successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Change individual guest status
  const handleChangeStatus = async (id: string, currentStatus: "confirmed" | "pending" | "declined") => {
    const nextStatusMap: Record<string, "confirmed" | "pending" | "declined"> = {
      pending: "confirmed",
      confirmed: "declined",
      declined: "pending"
    };
    const nextStatus = nextStatusMap[currentStatus];

    try {
      const res = await fetch(`/api/rsvp/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchGuests();
        showToast(`Status updated to ${nextStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete guest response
  const handleDeleteGuest = async (id: string) => {
    if (!confirm("Are you sure you want to remove this guest from the list?")) return;
    try {
      const res = await fetch(`/api/rsvp/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchGuests();
        showToast("Guest removed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated actions with visual feedbacks
  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // Mock / Simulation of bulk import CSV
  const handleImportCSV = async () => {
    setIsActionLoading(true);
    const mockCSVGuests = [
      { name: "Robert Baratheon", email: "bob@stormsend.com", phone: "+14050101", status: "confirmed", dietary: "High protein, wild boar" },
      { name: "Sansa Stark", email: "sansa@winterfell.org", phone: "+44710203", status: "confirmed", dietary: "Lemon cakes" },
      { name: "Tyrion Lannister", email: "tyrion@casterlyrock.com", phone: "+3369010", status: "pending", dietary: "Red wine" },
      { name: "Daenerys Targaryen", email: "dany@dragonstone.io", phone: "—", status: "declined", dietary: "Spicy food only" }
    ];

    try {
      const res = await fetch("/api/rsvp/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: mockCSVGuests })
      });
      if (res.ok) {
        fetchGuests();
        showToast("Imported 4 demo guests from invitation list successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Simulating Resend email system
  const handleSendInvitations = () => {
    showToast("Sending elegant invitation envelopes via Resend API mock service... 💌");
  };

  // WhatsApp bulk link share mockup
  const handleCopyWhatsAppLink = () => {
    const link = `${window.location.origin}/rsvp`;
    navigator.clipboard.writeText(link);
    showToast("RSVP link copied! Share with guests via WhatsApp! 📱");
  };

  // Filter and Search guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = 
      g.name.toLowerCase().includes(search.toLowerCase()) || 
      g.email.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && g.status === statusFilter;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredGuests.length / pageSize);
  const paginatedGuests = filteredGuests.slice(page * pageSize, (page + 1) * pageSize);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "G";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {/* Search and Action Toast Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full text-xs font-serif shadow-xl z-50 flex items-center gap-2 border border-outline"
          >
            <Feather size={14} className="animate-bounce" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-outline-variant/35 rotate-[-0.3deg]">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-1.5 text-on-surface">Guest List Management</h1>
          <p className="font-serif text-sm text-on-surface-variant italic leading-relaxed">
            Manage your circle of loved ones. Keep track of RSVPs and reach out with hand-crafted digital invitations.
          </p>
        </div>
        
        {/* Dynamic Action Buttons on Top Right */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={handleImportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface border border-outline hover:border-primary text-on-surface-variant rounded-sm hover:-rotate-1 transition-all shadow-sm font-serif text-xs cursor-pointer"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>
          
          <button 
            onClick={handleSendInvitations}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-sm rotate-0.5 transition-all shadow-sm font-serif text-xs cursor-pointer"
          >
            <Send size={14} />
            <span>Send via Resend</span>
          </button>

          <button 
            onClick={handleCopyWhatsAppLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-sm rotate-[-0.5deg] transition-all shadow-sm font-serif text-xs cursor-pointer"
          >
            <Share2 size={14} />
            <span>WhatsApp Link</span>
          </button>
        </div>
      </section>

      {/* Tactile Bento Stats cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest p-5 sketch-border rotate-[-0.5deg] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-1">Total Guests</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-on-surface">{totalGuests}</span>
            <Users size={16} className="text-secondary/60" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 sketch-border rotate-[0.8deg] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">Pending RSVPs</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-primary">{pendingCount}</span>
            <Clock size={16} className="text-primary/60" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 sketch-border rotate-[-1deg] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block mb-1">Confirmed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-on-surface">{confirmedCount}</span>
            <CheckCircle size={16} className="text-secondary/60" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 sketch-border rotate-[0.3deg] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Declined / Emails</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-on-surface">{declinedCount} / {emailsSent}</span>
            <Mail size={16} className="text-on-surface-variant/50" />
          </div>
        </div>
      </section>

      {/* Search, Filter bar and Add guest manual button */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded border border-outline-variant/40">
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input 
            type="text" 
            placeholder="Search guests by name..." 
            className="w-full bg-transparent pl-9 pr-3 py-1.5 border-b border-outline-variant/60 focus:border-primary outline-none font-serif text-sm transition-colors"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select 
            className="bg-transparent border border-outline-variant/60 px-3 py-1.5 font-serif text-xs rounded outline-none text-on-surface-variant focus:border-primary"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="all">All RSVP Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container rounded font-serif text-xs shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Add Guest</span>
          </button>
        </div>
      </section>

      {/* Guest Data Table Card */}
      <section className="bg-surface-container-lowest rounded-sm sketch-border overflow-hidden rotate-[0.1deg] shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span className="font-serif text-sm text-on-surface-variant italic">Retrieving parchment...</span>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-20 text-center font-serif text-sm text-on-surface-variant/70 italic">
            No guests found matching search parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-serif">
              <thead>
                <tr className="border-b border-outline-variant/60 bg-surface-container">
                  <th className="px-6 py-4 font-display text-sm text-on-surface-variant italic font-semibold">Name</th>
                  <th className="px-6 py-4 font-display text-sm text-on-surface-variant italic font-semibold">Email</th>
                  <th className="px-6 py-4 font-display text-sm text-on-surface-variant italic font-semibold">Phone/WhatsApp</th>
                  <th className="px-6 py-4 font-display text-sm text-on-surface-variant italic font-semibold">RSVP Status</th>
                  <th className="px-6 py-4 font-display text-sm text-on-surface-variant italic font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginatedGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-container-low transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Elegant Initials Avatar */}
                        <div className="w-8 h-8 rounded-full bg-secondary-container/80 flex items-center justify-center text-on-secondary-container font-semibold text-xs border border-secondary/20">
                          {getInitials(g.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{g.name}</p>
                          {g.dietary && g.dietary !== "None" && (
                            <p className="text-[10px] text-primary/80 italic mt-0.5">Dietary: {g.dietary}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/90">{g.email || "—"}</td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/90">{g.phone || "—"}</td>
                    <td className="px-6 py-4">
                      {/* Artistic hand-placed style Status Stamps */}
                      <button 
                        onClick={() => handleChangeStatus(g.id!, g.status)}
                        className="cursor-pointer transition-transform duration-200 active:scale-95 block text-left"
                        title="Click to cycle status"
                      >
                        {g.status === "confirmed" ? (
                          <span className="stamp-confirmed-small uppercase text-[10px] tracking-widest bg-emerald-50/50">Confirmed</span>
                        ) : g.status === "declined" ? (
                          <span className="stamp-pending-small text-red-700 border-red-700 uppercase text-[10px] tracking-widest bg-red-50/50">Declined</span>
                        ) : (
                          <span className="stamp-pending-small uppercase text-[10px] tracking-widest bg-amber-50/50">Pending</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => handleChangeStatus(g.id!, g.status)}
                          className="text-secondary hover:text-primary transition-colors cursor-pointer"
                          title="Cycle Status"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(g.id!)}
                          className="text-on-surface-variant/60 hover:text-red-700 transition-colors cursor-pointer"
                          title="Remove Guest"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Micro-hand pagination section */}
            <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-between items-center italic text-on-surface-variant text-xs">
              <span>Showing {paginatedGuests.length} of {filteredGuests.length} special guests</span>
              <div className="flex gap-4">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="hover:text-primary disabled:text-on-surface-variant/40 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={12} />
                  <span>Prior</span>
                </button>
                <button 
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="hover:text-primary disabled:text-on-surface-variant/40 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Manual Add Guest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface p-6 rounded sketchy-border max-w-sm w-full font-serif space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                <h3 className="font-display text-lg font-bold text-primary">Add Special Guest</h3>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary outline-none py-1 text-sm"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary outline-none py-1 text-sm"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary outline-none py-1 text-sm"
                    placeholder="e.g. +1234567"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="w-full py-2 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  {isActionLoading ? "Saving..." : "Add to Guest List"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Aesthetic Callout on Bottom */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-outline-variant/30">
        <div className="relative p-8 sketch-border bg-white rotate-[-0.8deg] shadow-xs overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Feather size={80} className="text-secondary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-3 text-secondary italic">The Digital Parchment</h3>
          <p className="font-serif text-xs text-on-surface-variant leading-relaxed mb-4">
            Every message sent through our system is designed to evoke the feeling of receiving a handwritten letter. Our delivery pipeline via Resend ensures your invitations land softly in inboxes, wrapped in elegance.
          </p>
          <div className="flex gap-4">
            <div className="h-[1.5px] w-12 bg-outline-variant self-center"></div>
            <span className="italic font-display text-xs text-primary font-semibold">A tradition, modernized.</span>
          </div>
        </div>

        <div className="relative rotate-[1.2deg] max-w-xs mx-auto">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQHv_KswuGOXS9DZqVePMeV4ONYuyRCACNF1T1lhHhr9QSISuvl-FAYeAoDHA4sDG4-0Mz6yws9uiUNgIs9y1AdoeEEYeC-hWNq7Xqkj5lopgCg2H0FvkxCTupC2xlBpXHHxqV2_mhWXQcgh4jWHNI022OYloEIrooKFb-NM7L_IusuzCrXDU6BCDlFyg-vMqzgMHviO5F6xB02htmfarQnj5kxZll5mvtRN_qUFLoW1eXXy2-jclQ" 
            alt="Stationery illustration" 
            className="w-full h-auto sketch-border shadow-xs hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-3 -right-3 bg-secondary text-on-secondary py-1.5 px-3 rotate-[-4deg] text-[10px] uppercase font-semibold tracking-wider shadow-xs">
            Curated with Love
          </div>
        </div>
      </section>
    </div>
  );
}
