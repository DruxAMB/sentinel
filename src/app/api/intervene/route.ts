import { NextRequest, NextResponse } from "next/server";
import { draftIntervention, checkCognitionBalance } from "@/lib/minds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conflictSummary, participantNames, patternMatch } = body;

    if (!conflictSummary || !participantNames) {
      return NextResponse.json(
        { error: "Missing required fields: conflictSummary, participantNames" },
        { status: 400 }
      );
    }

    // Check cognition balance
    const balance = await checkCognitionBalance();
    if (balance < 5) {
      return NextResponse.json({
        error: "Insufficient cognition balance for intervention drafting",
        balance,
      }, { status: 429 });
    }

    const intervention = await draftIntervention(
      conflictSummary,
      participantNames,
      patternMatch
    );

    return NextResponse.json({
      success: true,
      intervention,
      balance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Intervention drafting failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Degrade gracefully — return the seeded intervention as fallback
    return NextResponse.json({
      success: false,
      error: message,
      fallback: true,
      intervention: "Hey @alex and @jordan — I've noticed the palette discussion in #feedback has gotten tense over the past couple weeks. You both clearly care a lot about the craft, which is exactly what makes this community good. The limited-palette and wide-palette approaches are both legitimate and the community benefits from both perspectives being shared. Could we try framing feedback as 'here's why I'd choose X' rather than 'you should choose X'? I'd love to see both of you keep contributing without the friction. Happy to chat more if either of you wants to.",
    }, { status: 200 }); // 200 not 500 — the demo path degrades, never breaks
  }
}
