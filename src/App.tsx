import React, { useState, useEffect } from "react";
import { Invitation } from "./types";
import CreatorPanel from "./components/CreatorPanel";
import InvitationPreview from "./components/InvitationPreview";
import GuestlistPanel from "./components/GuestlistPanel";
import RsvpFormPanel from "./components/RsvpFormPanel";
import { Heart, Menu, Sparkles, Feather, Layers, BookOpen, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Active Tab: "creator" | "guestbook" | "rsvp"
  const [activeTab, setActiveTab] = useState<"creator" | "guestbook" | "rsvp">("creator");
  
  // App state loaded from full-stack Express server
  const [invitation, setInvitation] = useState<Invitation>({
    names: "Sarah & James",
    date: "October 24, 2024",
    time: "Four o'clock in the afternoon",
    venue: "The Oak Barn",
    location: "Sonoma Valley, California",
    story: "Our story began in a small coffee shop on a rainy Tuesday. One spilled latte led to a conversation that hasn't ended since.",
    tone: "romantic",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCIjkaT5fuRSDrI-UVUFNM4eYcIIz7YHHkCzoBTRGP-2EXJEzXHaHsfADQRlMnAvqAx1AkJFOVkhnUKTl8kg4zC0ojJj3ifp7fbH1TycRpGSE-f9rDmUCjllH6JxN2h4JypIcjjNnObkGTUFrry3dWcGwTyJZ9IdaprJJR_eGj8E-oVRL2f6RI6bja4unMaeXoiGTt9IEbN4i5Bg0EtlZqjyud1KrQ5lZSxdChPqEea0nh7OROEGjv",
    backgroundStyle: "paper"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [refreshGuestsTrigger, setRefreshGuestsTrigger] = useState(0);

  // Load invitation settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/invitation");
        if (res.ok) {
          const data = await res.json();
          if (data && data.names) {
            setInvitation(data);
          }
        }
      } catch (e) {
        console.warn("Could not load setting, using fallback.", e);
      }
    };
    loadSettings();
  }, []);

  // Save invitation settings to backend Express database
  const handleSaveInvitation = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invitation)
      });
      if (res.ok) {
        setSaveStatus("Invitation saved beautifully!");
        setTimeout(() => setSaveStatus(""), 4000);
      } else {
        setSaveStatus("Failed to save invitation.");
      }
    } catch (e) {
      setSaveStatus("Network issue, please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger guestbook update when guest RSVPs successfully
  const handleRsvpSuccess = () => {
    setRefreshGuestsTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-surface text-on-surface font-serif min-h-screen selection:bg-primary-fixed flex flex-col antialiased">
      {/* Global Natural Paper Overlay Grain */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.035] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      {/* Top Main Navigation Header */}
      <header className="bg-surface dark:bg-surface-dim w-full top-0 sticky z-40 border-b border-outline-variant shadow-[2px_2px_0px_0px_rgba(26,28,26,0.06)] bg-opacity-90 backdrop-blur-xs">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2 select-none">
            <Feather size={20} className="text-primary rotate-12" />
            <span className="font-display text-2xl md:text-3xl text-primary font-semibold italic -rotate-1">
              Everlasting Ties
            </span>
          </div>

          {/* Nav Tabs for different parts of application */}
          <nav className="hidden md:flex gap-8 items-center">
            <button
              onClick={() => setActiveTab("creator")}
              className={`font-serif text-sm font-semibold transition-all py-1.5 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "creator"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant/80 hover:text-primary hover:scale-102"
              }`}
            >
              <Layers size={14} />
              <span>Invitation Creator</span>
            </button>
            
            <button
              onClick={() => setActiveTab("guestbook")}
              className={`font-serif text-sm font-semibold transition-all py-1.5 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "guestbook"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant/80 hover:text-primary hover:scale-102"
              }`}
            >
              <Users size={14} />
              <span>Guest List / RSVPs</span>
            </button>

            <button
              onClick={() => setActiveTab("rsvp")}
              className={`font-serif text-sm font-semibold transition-all py-1.5 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "rsvp"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant/80 hover:text-primary hover:scale-102"
              }`}
            >
              <BookOpen size={14} />
              <span>RSVP Portal (Guest View)</span>
            </button>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveTab("rsvp");
                handleRsvpSuccess();
              }}
              className="text-primary hover:scale-110 transition-transform cursor-pointer"
              title="View Guest RSVP Site"
            >
              <Heart size={20} fill="#974400" strokeWidth={1} />
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === "creator" ? "guestbook" : "creator")}
              className="text-primary hover:scale-110 transition-transform cursor-pointer md:hidden"
              title="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout content with smooth animation transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* Dynamic Save Notifications */}
        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-6 py-2.5 rounded-full text-xs font-semibold shadow-md z-45 flex items-center gap-2 border border-secondary"
            >
              <Sparkles size={14} className="animate-spin" />
              <span>{saveStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content Router */}
        <AnimatePresence mode="wait">
          {activeTab === "creator" && (
            <motion.div
              key="creator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row gap-6 items-start mt-4"
            >
              {/* Creator Form Sidebar Customizer */}
              <div className="w-full lg:w-1/3 bg-surface-container-low rounded border border-outline-variant/50 p-4 md:p-6 shadow-xs max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                <CreatorPanel
                  invitation={invitation}
                  onChange={setInvitation}
                  onSave={handleSaveInvitation}
                  isSaving={isSaving}
                />
              </div>

              {/* Stationery Invitation Live Preview Canvas */}
              <div className="flex-1 bg-surface-container/40 border border-outline-variant/30 rounded-lg py-6 md:py-10 px-4 flex items-center justify-center relative overflow-hidden min-h-[calc(100vh-140px)] w-full">
                {/* Visual Label Indicator Badge */}
                <div className="absolute top-4 right-4 bg-on-surface text-surface px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold rotate-2 shadow-sm select-none z-10">
                  Live Invitation Preview
                </div>
                <InvitationPreview invitation={invitation} />
              </div>
            </motion.div>
          )}

          {activeTab === "guestbook" && (
            <motion.div
              key="guestbook"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <GuestlistPanel onRefreshTrigger={refreshGuestsTrigger} />
            </motion.div>
          )}

          {activeTab === "rsvp" && (
            <motion.div
              key="rsvp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 py-6"
            >
              <RsvpFormPanel invitation={invitation} onSuccess={handleRsvpSuccess} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <footer className="bg-surface-container/60 border-t border-outline-variant py-10 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="font-display text-lg text-on-surface font-semibold italic">Everlasting Ties</h4>
            <p className="font-serif text-xs italic text-on-surface-variant">Hand-crafted with love for your special day.</p>
          </div>
          <nav className="flex gap-6 text-xs text-on-surface-variant/80 font-serif">
            <button onClick={() => setActiveTab("creator")} className="hover:text-primary transition-colors cursor-pointer">Creator</button>
            <button onClick={() => setActiveTab("guestbook")} className="hover:text-primary transition-colors cursor-pointer">Guestbook</button>
            <button onClick={() => setActiveTab("rsvp")} className="hover:text-primary transition-colors cursor-pointer">RSVP Portal</button>
          </nav>
          <div className="text-on-surface-variant/60 text-[10px]">
            © {new Date().getFullYear()} Sarah & James Wedding. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
