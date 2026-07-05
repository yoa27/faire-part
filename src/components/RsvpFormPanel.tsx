import React, { useState } from "react";
import { Invitation, RSVP } from "../types";
import { Heart, Calendar, MapPin, Check, X, FileText, Music, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RsvpFormPanelProps {
  invitation: Invitation;
  onSuccess?: () => void;
}

export default function RsvpFormPanel({ invitation, onSuccess }: RsvpFormPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendance, setAttendance] = useState<"confirmed" | "declined" | "">("");
  const [dietary, setDietary] = useState("");
  const [plusOne, setPlusOne] = useState<"Yes" | "No">("No");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please write your full name.");
      return;
    }
    if (!attendance) {
      setError("Please let us know if you can make it.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload: RSVP = {
        name,
        email,
        phone,
        status: attendance,
        dietary: dietary || "None",
        plusOne
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit RSVP. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-10 font-serif">
      {/* Invitation Greeting Cover Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="bg-surface-container-low p-6 rounded border border-outline-variant/60 shadow-md rotate-[-0.5deg] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl"></div>
          
          <div className="space-y-4">
            {/* Visual Frame */}
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm sketchy-border relative bg-surface-container-high">
              <img 
                src={invitation.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCCIjkaT5fuRSDrI-UVUFNM4eYcIIz7YHHkCzoBTRGP-2EXJEzXHaHsfADQRlMnAvqAx1AkJFOVkhnUKTl8kg4zC0ojJj3ifp7fbH1TycRpGSE-f9rDmUCjllH6JxN2h4JypIcjjNnObkGTUFrry3dWcGwTyJZ9IdaprJJR_eGj8E-oVRL2f6RI6bja4unMaeXoiGTt9IEbN4i5Bg0EtlZqjyud1KrQ5lZSxdChPqEea0nh7OROEGjv"}
                alt="Sarah & James" 
                className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-center space-y-2 py-2">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-on-surface">
                {invitation.names}
              </h1>
              <p className="font-serif text-sm italic text-on-surface-variant">
                {invitation.date} • {invitation.venue}
              </p>
              <div className="w-12 h-px bg-outline/40 mx-auto my-3"></div>
              <p className="font-serif text-sm text-on-surface-variant leading-relaxed px-2 italic">
                "{invitation.story}"
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* RSVP Dynamic Form Card */}
      <motion.section 
        layout
        className="relative bg-surface p-8 sketchy-border shadow-md rotate-[0.5deg]"
      >
        {/* Animated Stamped Overlay upon Success */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div 
              initial={{ scale: 3, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 0.95, rotate: -15 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute inset-0 flex items-center justify-center bg-surface/85 backdrop-blur-xs z-20 rounded"
            >
              <div className="text-center p-6 space-y-4">
                <div className="stamp-confirmed border-[5px] border-primary text-primary px-8 py-3 font-display font-extrabold text-3xl tracking-widest inline-block select-none transform hover:scale-105 transition-transform duration-300">
                  {attendance === "confirmed" ? "CONFIRMED" : "DECLINED"}
                </div>
                <p className="font-serif text-base italic text-on-surface-variant mt-4">
                  {attendance === "confirmed" 
                    ? "Thank you! We can't wait to celebrate with you!" 
                    : "We will miss you! Thank you for letting us know."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setIsSubmitted(false);
                    setName("");
                    setEmail("");
                    setAttendance("");
                    setDietary("");
                  }}
                  className="mt-6 px-4 py-1.5 border border-outline-variant hover:border-primary font-serif text-xs rounded transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  Submit another response
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary">Will you join us?</h2>
            <p className="font-serif text-xs text-on-surface-variant uppercase tracking-widest mt-1.5 opacity-80">
              Kindly respond by September 1st
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Your Full Name
              </label>
              <input 
                type="text" 
                className="w-full bg-transparent border-b border-outline-variant/60 focus:border-primary focus:ring-0 font-serif text-base py-1.5 outline-none transition-colors"
                placeholder="e.g. Eleanor Rigby"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                className="w-full bg-transparent border-b border-outline-variant/60 focus:border-primary focus:ring-0 font-serif text-base py-1.5 outline-none transition-colors"
                placeholder="eleanor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Attendance Radios with Monoline Custom Checkmarks */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Can you make it?
              </label>
              <div className="flex flex-col gap-3.5 pt-1">
                {/* Yes - Coming */}
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative w-5 h-5 border-1.5 border-outline group-hover:border-primary transition-colors flex items-center justify-center bg-surface">
                    <input 
                      type="radio" 
                      name="attendance" 
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                      checked={attendance === "confirmed"}
                      onChange={() => setAttendance("confirmed")}
                    />
                    <Check 
                      size={14} 
                      className={`text-primary transition-transform duration-250 ${
                        attendance === "confirmed" ? "scale-100" : "scale-0"
                      }`} 
                      strokeWidth={3}
                    />
                  </div>
                  <span className="font-serif text-sm text-on-surface hover:text-primary transition-colors">
                    I'm Coming 🥂
                  </span>
                </label>

                {/* No - Decline */}
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative w-5 h-5 border-1.5 border-outline group-hover:border-primary transition-colors flex items-center justify-center bg-surface">
                    <input 
                      type="radio" 
                      name="attendance" 
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                      checked={attendance === "declined"}
                      onChange={() => setAttendance("declined")}
                    />
                    <X 
                      size={14} 
                      className={`text-primary transition-transform duration-250 ${
                        attendance === "declined" ? "scale-100" : "scale-0"
                      }`} 
                      strokeWidth={3}
                    />
                  </div>
                  <span className="font-serif text-sm text-on-surface hover:text-primary transition-colors">
                    Can't Make It 😔
                  </span>
                </label>
              </div>
            </div>

            {/* Plus One selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Are you bringing a Plus One (+1)?
              </label>
              <div className="flex gap-4">
                {["No", "Yes"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPlusOne(option as "Yes" | "No")}
                    className={`px-4 py-1 border text-xs rounded transition-all cursor-pointer ${
                      plusOne === option
                        ? "bg-secondary-container text-on-secondary-container border-secondary font-semibold"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary notes or Song Requests */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <FileText size={12} /> Dietary Notes / Song Request
              </label>
              <textarea 
                className="w-full bg-transparent border-b border-outline-variant/60 focus:border-primary focus:ring-0 font-serif text-sm py-1.5 outline-none resize-none"
                placeholder="Vegetarian diet, play Fleetwood Mac..."
                rows={2}
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </div>

            {error && <p className="text-red-700 text-xs font-serif pt-1">{error}</p>}

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-base rounded sketchy-border shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors mt-4"
            >
              {isSubmitting ? "Submitting response..." : "Submit RSVP Response"}
            </motion.button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}
