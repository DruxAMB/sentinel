"use client";

import { communityData } from "@/lib/seed-data";
import type { Message, Member, Tone, ConflictWatch } from "@/lib/types";
import { Shield, Activity, AlertTriangle, Eye, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { ConflictDetail } from "@/components/conflict-detail";

const toneColors: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  warm: "text-emerald-600 dark:text-emerald-400",
  playful: "text-blue-600 dark:text-blue-400",
  frustrated: "text-amber-600 dark:text-amber-400",
  defensive: "text-orange-600 dark:text-orange-400",
  hostile: "text-red-600 dark:text-red-400",
};

const toneBg: Record<Tone, string> = {
  neutral: "bg-muted",
  warm: "bg-emerald-500/10",
  playful: "bg-blue-500/10",
  frustrated: "bg-amber-500/10",
  defensive: "bg-orange-500/10",
  hostile: "bg-red-500/10",
};

const statusConfig = {
  active: { icon: AlertTriangle, label: "Active", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  monitoring: { icon: Eye, label: "Monitoring", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  resolved: { icon: CheckCircle2, label: "Resolved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
} as const;

const priorityConfig = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-muted-foreground",
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

function Avatar({ member, size = "sm" }: { member: Member; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${member.avatarColor} ${dims} flex shrink-0 items-center justify-center rounded-full font-medium text-white`}
    >
      {member.name.charAt(0)}
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const author = memberById(message.authorId);
  if (!author) return null;

  return (
    <div className={`flex gap-3 rounded-lg p-3 ${message.isFlaggedInteraction ? toneBg[message.tone] : "hover:bg-muted/50"}`}>
      <Avatar member={author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{author.name}</span>
          <span className="text-xs text-muted-foreground">{author.handle}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatDaysAgo(message.daysAgo)}</span>
          {message.isFlaggedInteraction && (
            <span className={`ml-auto text-xs font-medium ${toneColors[message.tone]}`}>
              {message.tone}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground leading-relaxed">{message.content}</p>
        <span className="mt-1 inline-block text-xs text-muted-foreground">{message.channel}</span>
      </div>
    </div>
  );
}

function ConflictCard({ conflict, onClick }: { conflict: ConflictWatch; onClick: () => void }) {
  const status = statusConfig[conflict.status];
  const StatusIcon = status.icon;
  const participants = conflict.participantIds.map(memberById).filter(Boolean) as Member[];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border ${status.border} ${status.bg} p-4 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          <span className={`text-xs font-medium ${priorityConfig[conflict.priority]}`}>
            {conflict.priority.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {conflict.interactionCount} interactions
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <Avatar member={p} size="sm" />
            <span className="text-sm font-medium">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Trajectory */}
      <div className="mt-3 flex items-center gap-1">
        {conflict.trajectory.map((tone, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <div className="h-px w-4 bg-border" />}
            <span className={`text-xs font-medium ${toneColors[tone]}`}>{tone}</span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{conflict.summary}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>First detected: {formatDaysAgo(conflict.firstDetectedDaysAgo)}</span>
        <span>Last: {formatDaysAgo(conflict.lastInteractionDaysAgo)}</span>
      </div>
    </button>
  );
}

export default function Home() {
  const [selectedConflict, setSelectedConflict] = useState<ConflictWatch | null>(null);
  const recentMessages = [...communityData.messages].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 15);
  const activeConflicts = communityData.conflicts.filter((c) => c.status === "active");
  const monitoringConflicts = communityData.conflicts.filter((c) => c.status === "monitoring");
  const resolvedConflicts = communityData.conflicts.filter((c) => c.status === "resolved");
  const latestSession = communityData.sessions[communityData.sessions.length - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Sentinel</span>
            <span className="text-muted-foreground text-sm">· {communityData.communityName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">Mind status:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">monitoring</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {communityData.members.length} members
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: Community feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Community Feed</h2>
              <div className="flex gap-2 text-xs">
                <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">#feedback</span>
                <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">#general</span>
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-border bg-card">
              {recentMessages.map((msg) => (
                <MessageRow key={msg.id} message={msg} />
              ))}
            </div>
          </div>

          {/* Right: Conflict Watch panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Conflict Watch</h2>
              <span className="text-xs text-muted-foreground">
                {activeConflicts.length} active · {monitoringConflicts.length} monitoring · {resolvedConflicts.length} resolved
              </span>
            </div>

            {/* Active conflicts */}
            {activeConflicts.length > 0 && (
              <div className="space-y-3">
                {activeConflicts.map((c) => (
                  <ConflictCard key={c.id} conflict={c} onClick={() => setSelectedConflict(c)} />
                ))}
              </div>
            )}

            {/* Monitoring */}
            {monitoringConflicts.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monitoring</span>
                {monitoringConflicts.map((c) => (
                  <ConflictCard key={c.id} conflict={c} onClick={() => setSelectedConflict(c)} />
                ))}
              </div>
            )}

            {/* Resolved */}
            {resolvedConflicts.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolved</span>
                {resolvedConflicts.map((c) => (
                  <ConflictCard key={c.id} conflict={c} onClick={() => setSelectedConflict(c)} />
                ))}
              </div>
            )}

            {/* Latest monitoring session summary */}
            {latestSession && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Latest monitoring run</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Session {latestSession.sessionNumber} · {formatDaysAgo(latestSession.daysAgo)} · {latestSession.duration}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {latestSession.messagesAnalyzed} messages analyzed
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Conflict detail modal */}
      {selectedConflict && (
        <ConflictDetail
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
        />
      )}
    </div>
  );
}
