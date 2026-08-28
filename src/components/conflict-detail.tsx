"use client";

import { communityData } from "@/lib/seed-data";
import type { ConflictWatch, ConflictInteraction, MonitoringSession, Member, Message, Tone } from "@/lib/types";
import {
  X,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Brain,
  MessageSquare,
  Send,
  History,
  ArrowRight,
  Lightbulb,
  GitBranch,
  Loader2,
  Mars,
  Venus,
} from "lucide-react";
import { useState, useEffect } from "react";

const toneColors: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  warm: "text-primary",
  playful: "text-primary",
  frustrated: "text-amber-500",
  defensive: "text-orange-500",
  hostile: "text-destructive",
};

const toneBg: Record<Tone, string> = {
  neutral: "bg-muted border-border",
  warm: "bg-primary/5 border-primary/20",
  playful: "bg-primary/5 border-primary/20",
  frustrated: "bg-amber-500/10 border-amber-500/30",
  defensive: "bg-orange-500/10 border-orange-500/30",
  hostile: "bg-destructive/10 border-destructive/30",
};

const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  warm: "bg-primary",
  playful: "bg-primary",
  frustrated: "bg-amber-500",
  defensive: "bg-orange-500",
  hostile: "bg-destructive",
};

const statusConfig = {
  active: { icon: AlertTriangle, label: "Active", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  monitoring: { icon: Eye, label: "Monitoring", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  resolved: { icon: CheckCircle2, label: "Resolved", color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
} as const;

const sessionStatusConfig = {
  no_conflict: { label: "No Conflict", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  monitoring: { label: "Monitoring", color: "text-amber-500", dot: "bg-amber-500" },
  escalating: { label: "Escalating", color: "text-orange-500", dot: "bg-orange-500" },
  intervene: { label: "Intervene", color: "text-destructive", dot: "bg-destructive" },
} as const;

function memberById(id: string): Member | undefined {
  return communityData.members.find((m) => m.id === id);
}

function formatDaysAgo(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 14) return "1 week ago";
  return `${Math.floor(daysAgo / 7)} weeks ago`;
}

function GenderIcon({ gender, size }: { gender: "male" | "female"; size: number }) {
  const Icon = gender === "male" ? Mars : Venus;
  return <Icon size={size} className="relative z-10 drop-shadow-sm" strokeWidth={2} />;
}

function Avatar({ member, size = "sm" }: { member: Member; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-8 w-8" : size === "md" ? "h-10 w-10" : "h-12 w-12";
  const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
  const color = member.avatarColor;
  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center rounded-full text-white relative overflow-hidden`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${color}ee 0%, ${color} 40%, ${color}99 100%)`,
        boxShadow: `0 2px 8px ${color}40, inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 50%)",
        }}
      />
      <GenderIcon gender={member.gender} size={iconSize} />
    </div>
  );
}

function InteractionCard({ interaction, messages }: { interaction: ConflictInteraction; messages: Message[] }) {
  const interactionMessages = messages.filter((m) => interaction.messageIds.includes(m.id));
  const participants = interaction.participantIds.map(memberById).filter(Boolean) as Member[];

  return (
    <div className={`rounded-xl border ${toneBg[interaction.tone]} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${toneDot[interaction.tone]}`} />
          <span className={`text-sm font-medium ${toneColors[interaction.tone]}`}>
            {interaction.tone.charAt(0).toUpperCase() + interaction.tone.slice(1)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDaysAgo(interaction.daysAgo)}</span>
      </div>

      <p className="mt-2 text-sm text-foreground">{interaction.summary}</p>

      <div className="mt-3 space-y-2">
        {interactionMessages.map((msg) => {
          const author = memberById(msg.authorId);
          if (!author) return null;
          return (
            <div key={msg.id} className="flex gap-2.5 rounded-lg bg-background/50 p-2.5">
              <Avatar member={author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground">{author.name}</span>
                  <span className="text-xs text-muted-foreground">{msg.channel}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-1">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <Avatar member={p} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Real Mind session from the API
interface RealSession {
  sessionNumber: number;
  prompt: string;
  reply: string;
  timestamp: string;
}

function RealSessionLog({ sessions }: { sessions: RealSession[] }) {
  return (
    <div className="space-y-3">
      {sessions.map((session, idx) => {
        // Infer status from the reply text
        let status: keyof typeof sessionStatusConfig = "monitoring";
        const replyLower = session.reply.toLowerCase();
        if (replyLower.includes("intervene") || replyLower.includes("should intervene")) {
          status = "intervene";
        } else if (replyLower.includes("escalat") || replyLower.includes("pattern")) {
          status = "escalating";
        } else if (replyLower.includes("no conflict") || replyLower.includes("baseline") || replyLower.includes("first time")) {
          status = "no_conflict";
        }
        const config = sessionStatusConfig[status];

        return (
          <div key={idx} className="relative pl-8">
            {idx < sessions.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
            )}
            <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full ${config.dot} ring-4 ring-background`} />

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">Session {session.sessionNumber}</span>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Live Mind</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{session.reply}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeededSessionLog({ sessions }: { sessions: MonitoringSession[] }) {
  return (
    <div className="space-y-3">
      {sessions.map((session, idx) => {
        const config = sessionStatusConfig[session.status];
        return (
          <div key={session.id} className="relative pl-8">
            {idx < sessions.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
            )}
            <div className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full ${config.dot} ring-4 ring-background`} />

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">Session {session.sessionNumber}</span>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDaysAgo(session.daysAgo)}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {session.duration} · {session.messagesAnalyzed} messages analyzed
              </p>
              <p className="mt-2 text-sm text-foreground leading-relaxed">{session.assessment}</p>
              {session.newFindings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {session.newFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ConflictDetail({ conflict, onClose }: { conflict: ConflictWatch; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"timeline" | "sessions" | "intervention">("timeline");
  const [interventionSent, setInterventionSent] = useState(false);
  const [realSessions, setRealSessions] = useState<RealSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsSource, setSessionsSource] = useState<"live" | "seeded">("seeded");

  // Fetch real Mind sessions on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchSessions() {
      try {
        const res = await fetch("/api/monitor");
        const data = await res.json();
        if (!cancelled && data.success && data.sessions && data.sessions.length > 0) {
          setRealSessions(data.sessions);
          setSessionsSource("live");
        }
      } catch {
        // Fall back to seeded data
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }
    fetchSessions();
    return () => { cancelled = true; };
  }, []);

  const status = statusConfig[conflict.status];
  const StatusIcon = status.icon;
  const participants = conflict.participantIds.map(memberById).filter(Boolean) as Member[];
  const conflictInteractions = communityData.interactions.filter((i) => i.conflictId === conflict.id);
  const conflictMessages = communityData.messages.filter((m) => m.conflictId === conflict.id);
  const seededSessions = communityData.sessions;
  const priorConflict = conflict.patternMatch
    ? communityData.conflicts.find((c) => c.id === conflict.patternMatch!.priorConflictId)
    : null;

  // Use the real Mind's last session reply as the intervention if available
  const realIntervention = realSessions.length > 0
    ? extractInterventionFromReply(realSessions[realSessions.length - 1].reply)
    : null;
  const interventionText = realIntervention || conflict.draftedIntervention?.content || "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4 lg:p-8">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-2xl border-b border-border bg-card p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{conflict.interactionCount} interactions over {conflict.firstDetectedDaysAgo} days</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {participants.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted-foreground text-sm">vs</span>}
                  <Avatar member={p} size="md" />
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.handle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Trajectory bar */}
        <div className="border-b border-border bg-muted/30 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trajectory</span>
            <div className="flex items-center gap-1.5 ml-2">
              {conflict.trajectory.map((tone, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 ${toneBg[tone]}`}>
                    <div className={`h-2 w-2 rounded-full ${toneDot[tone]}`} />
                    <span className={`text-xs font-medium ${toneColors[tone]}`}>{tone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "timeline" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Pattern Timeline
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "sessions" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            Mind Sessions
            {sessionsSource === "live" && (
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                LIVE
              </span>
            )}
          </button>
          {conflict.draftedIntervention && (
            <button
              onClick={() => setActiveTab("intervention")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "intervention" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Intervention
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {/* Mind's reasoning — pattern match */}
              {conflict.patternMatch && priorConflict && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Mind&apos;s Assessment</span>
                    {sessionsSource === "live" && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground leading-relaxed">
                    {conflict.patternMatch.similarity}
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/50 p-2.5">
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-0" />
                    <span className="text-xs text-muted-foreground">
                      Prior conflict: <span className="font-medium text-foreground">{conflict.patternMatch.priorParticipantNames.join(" vs ")}</span>
                      {" — "}
                      <span className={priorConflict.status === "resolved" ? "text-primary" : ""}>
                        {priorConflict.status === "resolved" ? "resolved via ban" : priorConflict.status}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Interaction timeline */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Interaction Timeline
                </h3>
                <div className="space-y-3">
                  {conflictInteractions.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      messages={conflictMessages}
                    />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{conflict.summary}</p>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                {sessionsLoading ? (
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Loading Mind sessions...
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </span>
                ) : sessionsSource === "live" ? (
                  <span className="text-sm font-medium text-muted-foreground">
                    {realSessions.length} monitoring runs from the live Mind
                  </span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {seededSessions.length} monitoring runs over {conflict.firstDetectedDaysAgo} days
                  </span>
                )}
              </div>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessionsSource === "live" && realSessions.length > 0 ? (
                <RealSessionLog sessions={realSessions} />
              ) : (
                <SeededSessionLog sessions={seededSessions} />
              )}
            </div>
          )}

          {activeTab === "intervention" && conflict.draftedIntervention && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Mind&apos;s Drafted Intervention
                </span>
                {sessionsSource === "live" && (
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Drafted by the Mind {sessionsSource === "live" ? "across 4 monitoring sessions" : `Today`} · Tone: {conflict.draftedIntervention.tone}
              </p>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {interventionText}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!interventionSent ? (
                  <>
                    <button
                      onClick={() => setInterventionSent(true)}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      Send to #feedback
                    </button>
                    <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                      Edit message
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Intervention sent to #feedback</span>
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-500">
                  This message was drafted autonomously by the Mind based on the conflict pattern and community norms.
                  Review before sending. The Mind will monitor responses and update its assessment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Extract the intervention message from the Mind's reply
// The Mind's session 4 reply contains a drafted message between --- markers
function extractInterventionFromReply(reply: string): string | null {
  const markerMatch = reply.match(/---\n([\s\S]*?)\n---/);
  if (markerMatch) return markerMatch[1].trim();

  // Fallback: look for "Draft message" or "Hey #feedback"
  const draftMatch = reply.match(/(?:Draft message|Hey #feedback)[\s\S]*?(?=\n[A-Z]|\nOne thing|$)/i);
  if (draftMatch) return draftMatch[0].trim();

  return null;
}
