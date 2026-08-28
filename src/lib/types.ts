// Core domain types for Sentinel

export type Tone = "neutral" | "warm" | "playful" | "frustrated" | "defensive" | "hostile";

export interface Member {
  id: string;
  name: string;
  handle: string;
  avatarColor: string; // hex color for 3D orb avatar
  joinedDaysAgo: number;
  role: "member" | "moderator" | "regular";
}

export interface Message {
  id: string;
  authorId: string;
  channel: string;
  content: string;
  timestamp: string; // ISO 8601
  daysAgo: number; // relative to "now" in the demo timeline
  tone: Tone;
  // Which conflict watch this message belongs to (if any)
  conflictId?: string;
  // Whether this is one of the flagged interactions in a conflict
  isFlaggedInteraction?: boolean;
}

export interface ConflictInteraction {
  id: string;
  conflictId: string;
  participantIds: string[];
  messageIds: string[];
  daysAgo: number;
  tone: Tone;
  summary: string; // what the exchange was about
}

export interface ConflictWatch {
  id: string;
  participantIds: string[];
  status: "active" | "resolved" | "monitoring";
  priority: "high" | "medium" | "low";
  firstDetectedDaysAgo: number;
  lastInteractionDaysAgo: number;
  interactionCount: number;
  trajectory: Tone[]; // tone over time: neutral -> frustrated -> hostile
  summary: string;
  // The Mind's reasoning: does this match a prior pattern?
  patternMatch?: {
    priorConflictId: string;
    priorParticipantNames: string[];
    similarity: string; // human-readable explanation
  };
  // The Mind's drafted intervention
  draftedIntervention?: {
    content: string;
    draftedAtDaysAgo: number;
    tone: string;
  };
}

export interface MonitoringSession {
  id: string;
  sessionNumber: number;
  daysAgo: number;
  duration: string; // human-readable
  messagesAnalyzed: number;
  assessment: string; // the Mind's running assessment
  newFindings: string[];
  status: "no_conflict" | "monitoring" | "escalating" | "intervene";
}

export interface CommunityData {
  members: Member[];
  messages: Message[];
  conflicts: ConflictWatch[];
  interactions: ConflictInteraction[];
  sessions: MonitoringSession[];
  communityName: string;
}
