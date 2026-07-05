import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

// Initialize Express App
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Load Firebase configuration
let firebaseConfig: any = null;
let db: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp(firebaseConfig);
    // Connect to the specific named Firestore database provided in the config
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
  } else {
    console.warn("firebase-applet-config.json not found. Database will be in-memory.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// In-Memory fallback database for local development without Firebase config
const inMemoryDb = {
  invitation: {
    names: "Sarah & James",
    date: "October 24, 2024",
    time: "Four o'clock in the afternoon",
    venue: "The Oak Barn",
    location: "Sonoma Valley, California",
    story: "Our story began in a small coffee shop on a rainy Tuesday. One spilled latte led to a conversation that hasn't ended since.",
    tone: "romantic",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCIjkaT5fuRSDrI-UVUFNM4eYcIIz7YHHkCzoBTRGP-2EXJEzXHaHsfADQRlMnAvqAx1AkJFOVkhnUKTl8kg4zC0ojJj3ifp7fbH1TycRpGSE-f9rDmUCjllH6JxN2h4JypIcjjNnObkGTUFrry3dWcGwTyJZ9IdaprJJR_eGj8E-oVRL2f6RI6bja4unMaeXoiGTt9IEbN4i5Bg0EtlZqjyud1KrQ5lZSxdChPqEea0nh7OROEGjv",
    backgroundStyle: "felt",
    primaryColor: "#974400",
    secondaryColor: "#556435"
  },
  rsvps: [
    { id: "1", name: "Jane Doe", email: "jane@example.com", phone: "+123456789", status: "confirmed", dietary: "None", plusOne: "No", timestamp: new Date().toISOString() },
    { id: "2", name: "John Smith", email: "john@example.com", phone: "", status: "pending", dietary: "Vegetarian", plusOne: "Yes", timestamp: new Date().toISOString() },
    { id: "3", name: "Emily Watson", email: "emily.w@resend.com", phone: "+447700900123", status: "confirmed", dietary: "Gluten free", plusOne: "No", timestamp: new Date().toISOString() },
    { id: "4", name: "Michael Thompson", email: "m.thompson@gmail.com", phone: "+155501099", status: "pending", dietary: "None", plusOne: "No", timestamp: new Date().toISOString() }
  ]
};

// HELPER: Get Invitation Document
async function getInvitationData() {
  if (db) {
    try {
      const docRef = doc(db, "settings", "invitation");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.error("Error reading invitation from Firestore, falling back to default:", e);
    }
  }
  return inMemoryDb.invitation;
}

// HELPER: Save Invitation Document
async function saveInvitationData(data: any) {
  if (db) {
    try {
      const docRef = doc(db, "settings", "invitation");
      await setDoc(docRef, data);
      return true;
    } catch (e) {
      console.error("Error saving invitation to Firestore:", e);
    }
  }
  inMemoryDb.invitation = { ...inMemoryDb.invitation, ...data };
  return true;
}

// HELPER: Get RSVPs List
async function getRSVPList() {
  if (db) {
    try {
      const colRef = collection(db, "rsvps");
      const querySnap = await getDocs(colRef);
      const list: any[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (list.length > 0) {
        return list;
      }
    } catch (e) {
      console.error("Error reading RSVPs from Firestore, falling back to local:", e);
    }
  }
  return inMemoryDb.rsvps;
}

// HELPER: Add RSVP
async function addRSVPItem(item: any) {
  const newItem = {
    ...item,
    timestamp: new Date().toISOString()
  };
  if (db) {
    try {
      const colRef = collection(db, "rsvps");
      const docRef = await addDoc(colRef, newItem);
      return { id: docRef.id, ...newItem };
    } catch (e) {
      console.error("Error adding RSVP to Firestore:", e);
    }
  }
  const id = Math.random().toString(36).substr(2, 9);
  const created = { id, ...newItem };
  inMemoryDb.rsvps.push(created);
  return created;
}

// HELPER: Update RSVP
async function updateRSVPItem(id: string, updates: any) {
  if (db) {
    try {
      const docRef = doc(db, "rsvps", id);
      await updateDoc(docRef, updates);
      return true;
    } catch (e) {
      console.error("Error updating RSVP in Firestore:", e);
    }
  }
  const index = inMemoryDb.rsvps.findIndex(r => r.id === id);
  if (index !== -1) {
    inMemoryDb.rsvps[index] = { ...inMemoryDb.rsvps[index], ...updates };
    return true;
  }
  return false;
}

// HELPER: Delete RSVP
async function deleteRSVPItem(id: string) {
  if (db) {
    try {
      const docRef = doc(db, "rsvps", id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error("Error deleting RSVP in Firestore:", e);
    }
  }
  const index = inMemoryDb.rsvps.findIndex(r => r.id === id);
  if (index !== -1) {
    inMemoryDb.rsvps.splice(index, 1);
    return true;
  }
  return false;
}

// ================= API ENDPOINTS =================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", firebaseConnected: !!db });
});

// 2. Get active invitation details
app.get("/api/invitation", async (req, res) => {
  try {
    const data = await getInvitationData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Save active invitation details
app.post("/api/invitation", async (req, res) => {
  try {
    const success = await saveInvitationData(req.body);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get list of all RSVPs / guests
app.get("/api/rsvp", async (req, res) => {
  try {
    const list = await getRSVPList();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Submit an RSVP / add a guest
app.post("/api/rsvp", async (req, res) => {
  try {
    const added = await addRSVPItem(req.body);
    res.json(added);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Update RSVP (e.g., status, attendance, notes)
app.put("/api/rsvp/:id", async (req, res) => {
  try {
    const success = await updateRSVPItem(req.params.id, req.body);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Delete an RSVP
app.delete("/api/rsvp/:id", async (req, res) => {
  try {
    const success = await deleteRSVPItem(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Bulk Import Guests (CSV/Array)
app.post("/api/rsvp/import", async (req, res) => {
  try {
    const guests = req.body.guests || [];
    const addedGuests = [];
    for (const g of guests) {
      const added = await addRSVPItem({
        name: g.name || "Unknown Guest",
        email: g.email || "",
        phone: g.phone || "",
        status: g.status || "pending",
        dietary: g.dietary || "None",
        plusOne: g.plusOne || "No"
      });
      addedGuests.push(added);
    }
    res.json({ success: true, count: addedGuests.length, guests: addedGuests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. AI Story Generation endpoint using modern @google/genai SDK
app.post("/api/generate-story", async (req, res) => {
  try {
    const { names, date, venue, tone, details } = req.body;
    
    const prompt = `Write a beautiful, short, single-paragraph romantic/wedding couple bio or story based on the following details:
Couple Names: ${names || "Sarah & James"}
Wedding Date: ${date || "October 24, 2024"}
Venue: ${venue || "The Oak Barn"}
Tone requested: ${tone || "romantic"}
Additional detail prompts or context: ${details || "how we met, what we love"}

Please write exactly 2-3 romantic, beautifully worded sentences. It must fit elegantly inside a physical wedding card. Speak in third-person or first-person, capturing the specified tone perfectly. Do not include any meta-commentary, introduction, or markdown styling—just the quote itself wrapped in double quotes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "You are an elegant and master wedding storyteller and stationery poet. You craft highly intimate, emotional, and polished romantic captions that capture the beautiful essence of couples' journeys in very few words."
      }
    });

    const story = response.text?.trim() || "";
    res.json({ story });
  } catch (error: any) {
    console.error("Gemini Story Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate story. Please verify your GEMINI_API_KEY." });
  }
});

// 10. AI Image Prompt Generation & Image Search or Generation Simulation
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Try to generate an image using gemini-3.1-flash-lite-image if API key supports it,
    // otherwise fallback to a lovely unsplash category keyword or stable curated illustration
    console.log("Generating image with prompt:", prompt);
    
    // We can run the Nano Banana model (requires a paid API key or standard secret)
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: `A vintage golden hour portrait of a couple for a wedding card invitation: ${prompt}. Film photo, warm grain, elegant, high detail`,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });

      let base64Image = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (base64Image) {
        return res.json({ imageUrl: base64Image });
      }
    } catch (e) {
      console.warn("Real image generation failed or not supported, falling back to Unsplash search term or default illustration:", e);
    }

    // Fallback: build a high quality dynamic search query from Unsplash
    const keywords = ["wedding", "couple", "love", "romantic", "vintage-couple", "marriage"];
    const matchedKeyword = keywords.find(k => prompt.toLowerCase().includes(k)) || "wedding-couple";
    const randomNum = Math.floor(Math.random() * 1000);
    const fallbackUrl = `https://images.unsplash.com/photo-${randomNum % 2 === 0 ? "1519741497674-611481863552" : "1511285560929-80b456fea0bc"}?auto=format&fit=crop&q=80&w=800`;
    
    res.json({ imageUrl: fallbackUrl, isFallback: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= VITE OR STATIC FILES =================

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start the Express server:", err);
});
