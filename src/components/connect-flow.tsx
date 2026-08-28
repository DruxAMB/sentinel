"use client";

import { useState } from "react";
import { MessageCircle, Hash, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Platform = "telegram" | "slack";
type ConnectStep = "select" | "credentials" | "connecting" | "connected" | "error";

interface ConnectedCommunity {
  platform: Platform;
  communityName: string;
  memberCount: number;
  messages: Array<{
    messageId: string;
    author: string;
    authorId: string;
    content: string;
    timestamp: string;
  }>;
}

export function ConnectFlow({
  onConnected,
  onBack,
}: {
  onConnected: (community: ConnectedCommunity) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<ConnectStep>("select");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");
  const [community, setCommunity] = useState<ConnectedCommunity | null>(null);

  const handleConnect = async () => {
    if (!platform || !botToken || !chatId) return;
    setStep("connecting");
    setError("");

    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, botToken, chatId }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Connection failed. Check your credentials.");
        setStep("error");
        return;
      }

      setCommunity(data.community);
      setStep("connected");

      // Auto-advance after showing success state
      setTimeout(() => {
        onConnected(data.community);
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to landing
        </button>

        {step === "select" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                Connect your community
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sentinel reads messages from your community platform and sends them to the Mind for
                conflict analysis. Choose your platform:
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setPlatform("telegram");
                  setStep("credentials");
                }}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0088cc]/10">
                  <MessageCircle className="h-6 w-6 text-[#0088cc]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Telegram</div>
                  <div className="text-xs text-muted-foreground">
                    Native Minds integration. Add the bot to your group.
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => {
                  setPlatform("slack");
                  setStep("credentials");
                }}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A154B]/10">
                  <Hash className="h-6 w-6 text-[#4A154B]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Slack</div>
                  <div className="text-xs text-muted-foreground">
                    Bridge integration. Install the bot app to your workspace.
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your credentials are stored in your browser session only — never committed to the
                repo. Messages are read read-only and forwarded to the Mind for analysis.
              </p>
            </div>
          </div>
        )}

        {step === "credentials" && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep("select")}
                className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Choose different platform
              </button>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                Connect to {platform === "telegram" ? "Telegram" : "Slack"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {platform === "telegram"
                  ? "Enter your bot token from @BotFather and the group chat ID."
                  : "Enter your Slack bot token (xoxb-...) and the channel ID."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {platform === "telegram" ? "Bot Token" : "Bot Token (xoxb-...)"}
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder={platform === "telegram" ? "7812345678:AAH..." : "xoxb-..."}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {platform === "telegram" ? "Group Chat ID" : "Channel ID"}
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder={platform === "telegram" ? "-100..." : "C..."}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {platform === "telegram" ? (
                    <>
                      Get the bot token from{" "}
                      <a
                        href="https://t.me/BotFather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        @BotFather
                      </a>
                      . Add the bot to your group. Get the chat ID by adding{" "}
                      <a
                        href="https://t.me/RawDataBot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        @RawDataBot
                      </a>{" "}
                      to the group.
                    </>
                  ) : (
                    <>
                      Create an app at{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        api.slack.com/apps
                      </a>
                      . Add scopes: <code className="text-foreground">channels:history</code>,{" "}
                      <code className="text-foreground">channels:read</code>. Install to workspace.
                      Invite the bot to your channel.
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={!botToken || !chatId}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Connect
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {platform === "telegram" ? "Reading messages from Telegram..." : "Reading messages from Slack..."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Fetching recent community messages</p>
          </div>
        )}

        {step === "connected" && community && (
          <div className="flex flex-col items-center justify-center py-20">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="mt-4 text-sm font-medium text-foreground">Connected to {community.communityName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {community.memberCount} members · {community.messages.length} messages loaded
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Loading dashboard...</p>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <p className="mt-4 text-sm font-medium text-foreground">Connection failed</p>
            <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">{error}</p>
            <button
              onClick={() => setStep("credentials")}
              className="mt-6 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
