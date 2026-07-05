export type InvitationTone = "romantic" | "playful" | "formal";
export type BackgroundStyle = "felt" | "paper" | "cream" | "rustic";

export interface Invitation {
  names: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  story: string;
  tone: InvitationTone;
  imageUrl: string;
  backgroundStyle: BackgroundStyle;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface RSVP {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: "confirmed" | "pending" | "declined";
  dietary: string;
  plusOne: "Yes" | "No";
  timestamp?: string;
}
