import { NextRequest, NextResponse } from "next/server";
import { runMonitoringSession, checkCognitionBalance, getMonitoringHistory, parseHistoryToSessions, MONITORING_ALIAS } from "@/lib/minds";
import { communityData } from "@/lib/seed-data";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — the Mind can take up to 2 min to reply

// POST: Run a new monitoring session (called by Vercel Cron or manually)
export async function POST(request: NextRequest) {
  // Auth: if CRON_SECRET is set, require Bearer token. If not set, allow all (demo mode).
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const trimmedSecret = cronSecret.trim();
    if (authHeader !== `Bearer ${trimmedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const balance = await checkCognitionBalance();
    if (balance < 10) {
      return NextResponse.json({
        error: "Insufficient cognition balance",
        balance,
      }, { status: 429 });
    }

    // Check if the request body contains live community messages
    let liveMessages: Array<{ author: string; content: string; channel: string; timestamp: string }> | null = null;
    try {
      const body = await request.json();
      if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
        liveMessages = body.messages;
      }
    } catch {
      // No body or invalid JSON — use seeded data (cron path)
    }

    // Use live messages if provided, otherwise fall back to seeded data
    const recentMessages = liveMessages || communityData.messages
      .filter((m) => m.daysAgo <= 3)
      .map((m) => {
        const author = communityData.members.find((mem) => mem.id === m.authorId);
        return {
          author: author?.name || "Unknown",
          content: m.content,
          channel: m.channel,
          timestamp: m.timestamp,
        };
      });

    const assessment = await runMonitoringSession(recentMessages);

    return NextResponse.json({
      success: true,
      alias: MONITORING_ALIAS,
      assessment,
      balance,
      messagesAnalyzed: recentMessages.length,
      timestamp: new Date().toISOString(),
      source: liveMessages ? "live" : "seeded",
    });
  } catch (error) {
    console.error("Monitoring session failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({
      success: false,
      error: message,
      fallback: true,
      assessment: "Monitoring session encountered an error. Using cached assessment.",
    }, { status: 200 });
  }
}

// GET: Retrieve the Mind's monitoring history (the persistence proof)
export async function GET() {
  try {
    const history = await getMonitoringHistory(50);
    const sessions = parseHistoryToSessions(history);

    return NextResponse.json({
      success: true,
      alias: MONITORING_ALIAS,
      sessions,
      sessionCount: sessions.length,
      rawHistoryLength: history.length,
    });
  } catch (error) {
    console.error("Failed to retrieve monitoring history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({
      success: false,
      error: message,
      sessions: [],
      sessionCount: 0,
    }, { status: 200 });
  }
}
