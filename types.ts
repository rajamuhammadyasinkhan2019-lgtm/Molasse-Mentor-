export type Role = 'user' | 'model';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  role: Role;
  parts: MessagePart[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface StarterPrompt {
  label: string;
  text: string;
}

export interface MineralEntry {
  name: string;
  percentage: number;
}

export interface NotebookEntry {
  id: string;
  sampleId: string;
  date: string;
  owner?: string;
  image?: string; // base64 encoded string (Hand Sample)
  thinSectionImage?: string; // base64 encoded string (Photomicrograph)
  location: {
    lat?: number;
    lng?: number;
    manual?: string;
  };
  handSample: {
    color: string;
    texture: string;
    grainSize: string;
    structures: string;
    hardness: string;
    luster: string;
    magnetism: string;
    fossils: string;
  };
  thinSection: {
    mineralList: MineralEntry[];
    minerals: string; // Keep for backward compatibility/general notes
    percentages: string;
    textures: string;
    pplFeatures: string; // Systematic PPL: Color, Relief, Cleavage
    xplFeatures: string; // Systematic XPL: Birefringence, Extinction, Twinning
    opticalProperties: string; // Deprecated but kept for compatibility
    pplXplFeatures: string; // Deprecated but kept for compatibility
    qfl?: {
      q: number;
      f: number;
      l: number;
    };
  };
  interpretation: string;
  inferredProvenance: string;
  tectonicSetting: string;
  questions: string;
}

export type AppView = 'chat' | 'notebook';