import { createMindsClient, type MindsClient, type MessageRecord } from "@animocabrands/minds-client-lib";

/**
 * Minds client integration for Sentinel.
 *
 * The Mind acts as the community conflict monitor. Each monitoring run:
 * 1. Uses a persistent conversation alias (so the Mind remembers across runs)
 * 2. Sends recent community messages to the Mind for analysis
 * 3. The Mind updates its running assessment (persisted in conversation history)
 * 4. We retrieve the full history to show the session log (the persistence proof)
 *
 * The conversation alias is stable across monitoring runs — this is what gives
 * the Mind continuity. The Mind's getHistory() is the memory.
 */

const MIND_ID = process.env.MINDS_MIND_ID!;
const BUILDER_API_KEY = process.env.MINDS_BUILDER_API_KEY!;

// Stable alias for the monitoring conversation — the Mind remembers across runs
const MONITORING_ALIAS = "sentinel-monitoring-pixel-forge";

let _client: MindsClient | null = null;

export function getMindsClient(): MindsClient {
  if (!_client) {
    if (!BUILDER_API_KEY) {
      throw new Error("MINDS_BUILDER_API_KEY is not set. Add it to .env.local");
    }
    _client = createMindsClient({ builderApiKey: BUILDER_API_KEY });
  }
  return _client;
}

/**
 * Ensure the monitoring conversation exists (creates it on first run, reuses on subsequent).
 * The Mind's persistent memory is tied to this conversation alias.
 */
export async function ensureMonitoringConversation(): Promise<void> {
  const client = getMindsClient();
  await client.ensureConversation(MONITORING_ALIAS, MIND_ID);
}

/**
 * Run a monitoring session: send recent community messages to the Mind and get its assessment.
 *
 * The prompt is designed to make the Mind:
 * - Analyze interaction patterns (not just individual messages)
 * - Compare against its memory of prior conflicts (getHistory)
 * - Update its running assessment
 * - Detect escalation trajectories
 * - Recommend interventions when needed
 */
export async function runMonitoringSession(
  recentMessages: Array<{ author: string; content: string; channel: string; timestamp: string }>
): Promise<string> {
  const client = getMindsClient();
  await ensureMonitoringConversation();

  const messagesText = recentMessages
    .map((m) => `[${m.timestamp}] ${m.author} in ${m.channel}: ${m.content}`)
    .join("\n");

  const prompt = `You are Sentinel, a persistent community conflict monitor for the Pixel Forge pixel art community.

You have been monitoring this community across multiple sessions. Your memory of prior interactions and conflicts is in your conversation history — use it to detect patterns over time.

Here are the recent messages from the community:

${messagesText}

Analyze these messages for:
1. Conflict patterns: Are there recurring disagreements between the same members? Is the tone escalating?
2. Pattern matching: Does this match any prior conflict trajectory you've seen in this community? (Check your memory of past sessions.)
3. Trajectory assessment: What is the tone trajectory? (neutral → frustrated → hostile, etc.)
4. Intervention recommendation: Should someone intervene? If so, what should they do?

Provide your assessment as a concise update. If this is your first session, establish a baseline. If you've monitored before, compare to your prior assessment and note what has changed.

Format your response as:
ASSESSMENT: [your running assessment]
STATUS: [no_conflict | monitoring | escalating | intervene]
NEW FINDINGS: [bullet list of any new findings, or "none"]`;

  await client.sendMessage({
    alias: MONITORING_ALIAS,
    messageText: prompt,
  });

  const result = await client.waitForReply({
    alias: MONITORING_ALIAS,
    timeoutMs: 30000,
  });

  if (result.timedOut) {
    return "ASSESSMENT: Monitoring timed out. Will retry next session.\nSTATUS: monitoring\nNEW FINDINGS: none";
  }

  return result.reply.messageText || "No assessment returned.";
}

/**
 * Retrieve the Mind's full conversation history — this IS the persistence proof.
 * Each message in the history is either a monitoring prompt we sent or the Mind's
 * assessment. Together they show the Mind working across sessions over time.
 */
export async function getMonitoringHistory(limit = 50): Promise<MessageRecord[]> {
  const client = getMindsClient();
  return client.getHistory(MONITORING_ALIAS, { limit });
}

/**
 * Ask the Mind to draft an intervention message for a specific conflict.
 * This is the autonomous action — the Mind doesn't just detect, it acts.
 */
export async function draftIntervention(
  conflictSummary: string,
  participantNames: string[],
  patternMatch?: string
): Promise<string> {
  const client = getMindsClient();
  await ensureMonitoringConversation();

  const prompt = `You are Sentinel. A conflict in the Pixel Forge community has escalated to the point where intervention is recommended.

Conflict details:
- Participants: ${participantNames.join(" vs ")}
- Summary: ${conflictSummary}
${patternMatch ? `- Pattern match: ${patternMatch}` : ""}

Draft a de-escalation message to post in the community channel. The message should:
- Be empathetic and non-accusatory
- Acknowledge both perspectives as valid
- Suggest a concrete reframing (how to give feedback differently)
- Not single out either person as the "problem"
- Be written in the voice of a community moderator who cares about both members

Return only the message text, ready to post.`;

  await client.sendMessage({
    alias: MONITORING_ALIAS,
    messageText: prompt,
  });

  const result = await client.waitForReply({
    alias: MONITORING_ALIAS,
    timeoutMs: 30000,
  });

  if (result.timedOut) {
    return "Unable to draft intervention at this time. Please try again.";
  }

  return result.reply.messageText || "No intervention drafted.";
}

/**
 * Check the cognition balance before running a monitoring session or recording.
 * Running dry mid-recording would kill the demo.
 */
export async function checkCognitionBalance(): Promise<number> {
  const client = getMindsClient();
  const balance = await client.getCognitionBalance(MIND_ID);
  return balance.cognition;
}

export { MONITORING_ALIAS };
