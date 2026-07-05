import React from "react";
import { Invitation } from "../types";
import { Calendar, MapPin, Quote, Heart, Sparkles, Smile, MessageSquareText } from "lucide-react";
import { motion } from "motion/react";

interface InvitationPreviewProps {
  invitation: Invitation;
}

export default function InvitationPreview({ invitation }: InvitationPreviewProps) {
  // Determine grain and color styles based on selection
  const bgStyles = {
    felt: "bg-[#f4f3f1] felt-grain",
    paper: "bg-[#faf9f6] paper-grain",
    cream: "bg-[#fcfbf4] paper-grain",
    rustic: "bg-[#f5ebd6] felt-grain",
  };

  return (
    <div className="relative flex items-center justify-center w-full p-4 md:p-8">
      {/* Invitation Canvas Wrapper with custom rotate and shadow */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ rotate: "0.4deg" }}
        className={`${
          bgStyles[invitation.backgroundStyle] || bgStyles.paper
        } w-full max-w-xl min-h-[750px] p-8 md:p-14 border border-outline-variant/60 hard-shadow relative flex flex-col items-center text-center overflow-hidden`}
      >
        {/* Intimate Corner Leaf/Ornament Illustrations (Using elegant Lucide Icons as monoline sketches) */}
        <div className="absolute top-6 left-6 text-secondary/40 select-none">
          <Sparkles size={36} strokeWidth={1} />
        </div>
        <div className="absolute top-6 right-6 text-secondary/40 -rotate-90 select-none">
          <Sparkles size={36} strokeWidth={1} />
        </div>
        <div className="absolute bottom-6 left-6 text-secondary/40 rotate-90 select-none">
          <Sparkles size={36} strokeWidth={1} />
        </div>
        <div className="absolute bottom-6 right-6 text-secondary/40 rotate-180 select-none">
          <Sparkles size={36} strokeWidth={1} />
        </div>

        {/* Small Elegant Overhead Header */}
        <div className="space-y-4 mb-8 z-10">
          <span className="font-serif text-xs uppercase tracking-[0.25em] text-on-surface-variant font-semibold">
            The Wedding Of
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary leading-tight font-semibold italic">
            {invitation.names.split("&")[0]?.trim() || "Sarah"}{" "}
            <span className="font-normal text-3xl md:text-4xl text-on-surface-variant/80 italic font-serif">&amp;</span>{" "}
            {invitation.names.split("&")[1]?.trim() || "James"}
          </h2>
        </div>

        {/* Tactile Couple Photograph with torn-edge style */}
        <div className="relative w-56 h-56 md:w-64 md:h-64 mb-10 -rotate-1 select-none z-10 group">
          {/* Offset physical background paper layout */}
          <div className="absolute inset-0 bg-secondary/10 rotate-3 torn-edge opacity-40 group-hover:rotate-1 transition-transform duration-500"></div>
          
          <img
            src={invitation.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCCIjkaT5fuRSDrI-UVUFNM4eYcIIz7YHHkCzoBTRGP-2EXJEzXHaHsfADQRlMnAvqAx1AkJFOVkhnUKTl8kg4zC0ojJj3ifp7fbH1TycRpGSE-f9rDmUCjllH6JxN2h4JypIcjjNnObkGTUFrry3dWcGwTyJZ9IdaprJJR_eGj8E-oVRL2f6RI6bja4unMaeXoiGTt9IEbN4i5Bg0EtlZqjyud1KrQ5lZSxdChPqEea0nh7OROEGjv"}
            alt="The Happy Couple"
            className="w-full h-full object-cover torn-edge hard-shadow"
            referrerPolicy="no-referrer"
          />

          {/* Floating Stamped Heart Emblem */}
          <div className="absolute -bottom-3 -right-3 bg-surface p-2.5 rounded-lg sketchy-border rotate-6 text-primary hover:scale-110 hover:-rotate-6 transition-all duration-300">
            <Heart size={24} fill="#974400" strokeWidth={1.5} className="animate-pulse" />
          </div>
        </div>

        {/* Intimate Spaced Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-on-surface-variant max-w-md w-full mb-8 relative z-10">
          <div className="space-y-1.5 rotate-[-0.5deg] p-2 hover:bg-surface-container/30 rounded transition-colors">
            <div className="flex justify-center text-secondary/80 mb-1">
              <Calendar size={20} strokeWidth={1.5} />
            </div>
            <p className="font-display text-xl font-semibold">{invitation.date || "October 24, 2024"}</p>
            <p className="font-serif text-sm opacity-80 italic">{invitation.time || "Four o'clock in the afternoon"}</p>
          </div>

          <div className="space-y-1.5 rotate-[0.5deg] p-2 hover:bg-surface-container/30 rounded transition-colors">
            <div className="flex justify-center text-secondary/80 mb-1">
              <MapPin size={20} strokeWidth={1.5} />
            </div>
            <p className="font-display text-xl font-semibold">{invitation.venue || "The Oak Barn"}</p>
            <p className="font-serif text-sm opacity-80 italic">{invitation.location || "Sonoma Valley, California"}</p>
          </div>
        </div>

        {/* Story Block / Quote */}
        <div className="relative max-w-sm mx-auto mb-6 z-10 px-4">
          <div className="absolute -top-3 -left-2 text-primary/10 rotate-12 select-none">
            <Quote size={32} />
          </div>
          <p className="font-serif text-base italic leading-relaxed text-on-surface-variant text-center px-4">
            "{invitation.story || "Our story began in a small coffee shop on a rainy Tuesday. One spilled latte led to a conversation that hasn't ended since."}"
          </p>
          <div className="w-20 h-1.5 bg-outline-variant/60 mx-auto mt-4 hand-drawn-underline"></div>
        </div>

        {/* Footer Flourishes */}
        <div className="mt-auto pt-4 flex gap-5 text-secondary/65 select-none z-10">
          <Smile size={24} strokeWidth={1.5} />
          <MessageSquareText size={24} strokeWidth={1.5} />
          <Heart size={24} strokeWidth={1.5} />
        </div>
      </motion.div>
    </div>
  );
}
