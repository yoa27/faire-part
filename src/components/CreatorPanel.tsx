import React, { useState } from "react";
import { Invitation, InvitationTone, BackgroundStyle } from "../types";
import { Sparkles, Save, BookOpen, Palette, Image as ImageIcon, Check, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface CreatorPanelProps {
  invitation: Invitation;
  onChange: (updated: Invitation) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export default function CreatorPanel({ invitation, onChange, onSave, isSaving }: CreatorPanelProps) {
  const [storyDetail, setStoryDetail] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [storyError, setStoryError] = useState("");
  const [imageError, setImageError] = useState("");

  const tones: { value: InvitationTone; label: string; style: string }[] = [
    { value: "romantic", label: "Romantic 🌸", style: "rotate-[-1deg]" },
    { value: "playful", label: "Playful ✨", style: "rotate-[1deg]" },
    { value: "formal", label: "Formal 🏛️", style: "rotate-[-0.5deg]" },
  ];

  const papers: { value: BackgroundStyle; label: string; color: string }[] = [
    { value: "paper", label: "Linen Cream", color: "bg-[#faf9f6]" },
    { value: "felt", label: "Soft Felt", color: "bg-[#f4f3f1]" },
    { value: "cream", label: "Antique Ivory", color: "bg-[#fcfbf4]" },
    { value: "rustic", label: "Rustic Kraft", color: "bg-[#f5ebd6]" },
  ];

  // Call the server Gemini API to compose a romantic bio
  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    setStoryError("");
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: invitation.names,
          date: invitation.date,
          venue: invitation.venue,
          tone: invitation.tone,
          details: storyDetail || invitation.story,
        }),
      });
      const data = await res.json();
      if (res.ok && data.story) {
        // Strip leading/trailing quotation marks if any
        const cleanedStory = data.story.replace(/^["']|["']$/g, "");
        onChange({ ...invitation, story: cleanedStory });
      } else {
        setStoryError(data.error || "Failed to generate story. Please try again.");
      }
    } catch (e: any) {
      setStoryError("API Connection issue. Check server logs.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Call the server Image Generation API to generate / select couple image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError("Please write a short prompt describing your dream photo.");
      return;
    }
    setIsGeneratingImage(true);
    setImageError("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        onChange({ ...invitation, imageUrl: data.imageUrl });
      } else {
        setImageError(data.error || "Image generation limit exceeded. Try again shortly.");
      }
    } catch (e: any) {
      setImageError("Failed to connect to image generator.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md mx-auto p-4">
      <header className="rotate-[-0.5deg]">
        <h2 className="font-display text-3xl font-bold text-on-surface">Design Your Story</h2>
        <p className="font-serif text-sm text-on-surface-variant opacity-80 mt-1">
          Every detail hand-crafted, celebrating your unique forever.
        </p>
      </header>

      <div className="space-y-6">
        {/* Wedding Couple Name Input */}
        <div className="group">
          <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
            The Happy Couple
          </label>
          <input
            type="text"
            className="w-full bg-transparent border-b-2 border-outline/50 focus:border-primary outline-none py-1.5 font-display text-xl italic transition-all"
            placeholder="Sarah & James"
            value={invitation.names}
            onChange={(e) => onChange({ ...invitation, names: e.target.value })}
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
              The Date
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-outline/50 focus:border-primary outline-none py-1.5 font-serif text-sm transition-all"
              placeholder="October 24, 2024"
              value={invitation.date}
              onChange={(e) => onChange({ ...invitation, date: e.target.value })}
            />
          </div>
          <div className="group">
            <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
              The Time
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-outline/50 focus:border-primary outline-none py-1.5 font-serif text-sm transition-all"
              placeholder="4:00 PM"
              value={invitation.time}
              onChange={(e) => onChange({ ...invitation, time: e.target.value })}
            />
          </div>
        </div>

        {/* Venue & Location Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
              The Venue
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-outline/50 focus:border-primary outline-none py-1.5 font-serif text-sm transition-all"
              placeholder="The Oak Barn"
              value={invitation.venue}
              onChange={(e) => onChange({ ...invitation, venue: e.target.value })}
            />
          </div>
          <div className="group">
            <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
              The Location
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-outline/50 focus:border-primary outline-none py-1.5 font-serif text-sm transition-all"
              placeholder="Sonoma, California"
              value={invitation.location}
              onChange={(e) => onChange({ ...invitation, location: e.target.value })}
            />
          </div>
        </div>

        {/* Custom Story Bio with Textarea */}
        <div className="group">
          <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1.5">
            Our Story (Invitation Text)
          </label>
          <textarea
            className="w-full bg-surface border border-outline-variant rounded-md p-3 font-serif text-sm outline-none focus:ring-1 focus:ring-primary transition-all sketchy-border resize-none"
            rows={3}
            placeholder="Write your custom story bio here or generate an elegant one using Gemini..."
            value={invitation.story}
            onChange={(e) => onChange({ ...invitation, story: e.target.value })}
          />
        </div>

        {/* Tone Selection Toggles */}
        <div className="space-y-2">
          <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">
            Invitation Voice & Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => onChange({ ...invitation, tone: t.value })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer hover:scale-105 ${t.style} ${
                  invitation.tone === t.value
                    ? "bg-secondary-container text-on-secondary-container border border-secondary"
                    : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Story Prompt for Gemini */}
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/50 relative">
          <div className="absolute top-2 right-2 text-primary">
            <Sparkles size={16} />
          </div>
          <label className="font-serif text-xs font-semibold text-on-surface-variant block mb-1">
            Let AI refine or compose your story
          </label>
          <input
            type="text"
            className="w-full bg-surface border border-outline-variant/60 rounded px-2.5 py-1.5 font-serif text-xs outline-none focus:border-primary mb-2"
            placeholder="e.g., We met in Paris, love hiking, spilled coffee..."
            value={storyDetail}
            onChange={(e) => setStoryDetail(e.target.value)}
          />
          <button
            onClick={handleGenerateStory}
            disabled={isGeneratingStory}
            className="w-full bg-primary text-on-primary hover:bg-primary-container disabled:bg-primary/50 text-xs font-serif font-semibold py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isGeneratingStory ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Crafting with Gemini...
              </>
            ) : (
              <>
                <BookOpen size={14} />
                Generate Story Bio
              </>
            )}
          </button>
          {storyError && <p className="text-red-700 text-xs mt-1.5 font-serif">{storyError}</p>}
        </div>

        {/* Custom Photograph Generator with Gemini Image model */}
        <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/50 relative">
          <div className="absolute top-2 right-2 text-primary">
            <Palette size={16} />
          </div>
          <label className="font-serif text-xs font-semibold text-on-surface-variant block mb-1">
            Generate customized Couple Art or Photograph
          </label>
          <input
            type="text"
            className="w-full bg-surface border border-outline-variant/60 rounded px-2.5 py-1.5 font-serif text-xs outline-none focus:border-primary mb-2"
            placeholder="e.g. Vintage wedding photo, rustic oak tree background"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
          />
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
            className="w-full bg-secondary text-on-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-xs font-serif font-semibold py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isGeneratingImage ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Generating Illustration...
              </>
            ) : (
              <>
                <ImageIcon size={14} />
                Generate Custom Portrait
              </>
            )}
          </button>
          {imageError && <p className="text-red-700 text-xs mt-1.5 font-serif">{imageError}</p>}
        </div>

        {/* Background Paper selection */}
        <div className="space-y-2">
          <label className="font-serif text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">
            Stationery Paper Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {papers.map((p) => (
              <button
                key={p.value}
                onClick={() => onChange({ ...invitation, backgroundStyle: p.value })}
                className={`p-2.5 rounded border text-left flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] ${
                  invitation.backgroundStyle === p.value
                    ? "border-primary bg-surface shadow-sm"
                    : "border-outline-variant/50 bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border border-outline-variant/80 ${p.color}`} />
                <span className="font-serif text-xs font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Save Progress action */}
        <div className="pt-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-4 bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-lg rounded-lg sketchy-border shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isSaving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Saving stationery...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Design Settings
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
