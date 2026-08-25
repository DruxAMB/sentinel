import { NextRequest, NextResponse } from "next/server";
import { runMonitoringSession, checkCognitionBalance, MONITORING_ALIAS } from "@/lib/minds";
import { communityData } from "@/lib/seed-data";

// This route is called by Vercel Cron (or manually) to run a monitoring session.
// The Mind reads recent community messages, updates its running assessment,
// and returns its analysis. The assessment is persisted in the Mind's conversation
// history — that persistence IS the product.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Check for Vercel Cron auth header (or a manual trigger)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow unauthenticated requests in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Check cognition balance before running
    const balance = await checkCognitionBalance();
    if (balance < 10) {
      return NextResponse.json({
        error: "Insufficient cognition balance",
        balance,
        message: "Refill cognition credits before running another monitoring session.",
      }, { status: 429 });
    }

    // Get recent community messages to send to the Mind
    const recentMessages = communityData.messages
      .filter((m) => m.daysAgo <= 3) // last 3 days
      .map((m) => {
        const author = communityData.members.find((mem) => mem.id === m.authorId);
        return {
          author: author?.name || "Unknown",
          content: m.content,
          channel: m.channel,
          timestamp: m.timestamp,
        };
      });

    // Run the monitoring session
    const assessment = await runMonitoringSession(recentMessages);

    return NextResponse.json({
      success: true,
      alias: MONITORING_ALIAS,
      assessment,
      balance,
      messagesAnalyzed: recentMessages.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monitoring session failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Degrade gracefully — return a fallback assessment so the demo path never breaks
    return NextResponse.json({
      success: false,
      error: message,
      fallback: true,
      assessment: "ASSESSMENT: Monitoring session encountered an error. Using cached assessment.\nSTATUS: monitoring\nNEW FINDINGS: none",
    }, { status: 200 }); // 200 not 500 — the demo path degrades, never breaks
  }
}

// GET endpoint to retrieve the Mind's monitoring history (the persistence proof)
export async function GET() {
  try {
    const { getMonitoringHistory } = await import("@/lib/minds");
    const history = await getMonitoringHistory(50);

    return NextResponse.json({
      success: true,
      alias: MONITORING_ALIAS,
      history,
      sessionCount: Math.floor(history.length / 2), // each session = 1 prompt + 1 reply
    });
  } catch (error) {
    console.error("Failed to retrieve monitoring history:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({
      success: false,
      error: message,
      history: [],
    }, { status: 200 }); // degrade gracefully
  }
}
