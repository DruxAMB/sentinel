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
 *
 * SPIKE FINDINGS (2026-08-25):
 * - The Mind takes 40-120s to reply. waitForReply with 60s timeout is unreliable.
 * - Use a polling approach: send message, then poll getHistory until a new Mind reply appears.
 * - The Mind returns HTML (<p> tags) in replies — strip them.
 * - The Mind has genuine personality and pushes back on prescriptive prompts.
 * - The Mind's conversation history IS the persistence — it remembers across sessions.
 * - Cognition balance: 182.44 credits (sufficient for the demo).
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
 */
export async function ensureMonitoringConversation(): Promise<void> {
  const client = getMindsClient();
  await client.ensureConversation(MONITORING_ALIAS, MIND_ID);
}

/**
 * Send a message and poll for the Mind's reply.
 * The Mind takes 40-120s to reply, so we poll getHistory instead of using waitForReply.
 */
async function sendAndWaitForReply(prompt: string, maxWaitMs = 180000): Promise<string | null> {
  const client = getMindsClient();
  await ensureMonitoringConversation();

  // Get the current history count before sending
  const initialHistory = await client.getHistory(MONITORING_ALIAS, { limit: 5 });
  const initialCount = initialHistory.length;

  // Send the message
  await client.sendMessage({
    alias: MONITORING_ALIAS,
    messageText: prompt,
  });

  // Poll for the Mind's reply
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 15000));
    try {
      const history = await client.getHistory(MONITORING_ALIAS, { limit: 5 });
      if (history.length > initialCount) {
        const newMsg = history[0]; // most recent first
        if (newMsg.senderType === 0 || newMsg.senderType === 2) {
          // Mind replied — strip HTML tags
          return (newMsg.messageText || "").replace(/<[^>]*>/g, "");
        }
      }
    } catch {
      // Transient network error — keep polling
    }
  }
  return null;
}

/**
 * Run a monitoring session: send recent community messages to the Mind and get its assessment.
 */
export async function runMonitoringSession(
  recentMessages: Array<{ author: string; content: string; channel: string; timestamp: string }>
): Promise<string> {
  const messagesText = recentMessages
    .map((m) => `[${m.timestamp}] ${m.author} in ${m.channel}: ${m.content}`)
    .join("\n");

  const prompt = `I'm building a community monitoring tool called Sentinel. You're the Mind that powers it. I need your help analyzing community interactions for conflict patterns.

Here are recent messages from the Pixel Forge pixel art community:

${messagesText}

I'd like your honest assessment of the social dynamics here. Specifically:
1. Are there recurring disagreements between the same members? Is the tone shifting?
2. Does this remind you of any patterns you've seen in our prior conversations? (Check your memory.)
3. What's the emotional trajectory — neutral, frustrated, hostile?
4. Do you think someone should intervene? What would you recommend?

Be direct and genuine. If this is your first time looking at this community, say so and establish a baseline. If you've analyzed these members before, tell me what's changed.

Please format your response as:
ASSESSMENT: [your assessment]
STATUS: [no_conflict | monitoring | escalating | intervene]
NEW FINDINGS: [any new observations, or "none"]`;

  const reply = await sendAndWaitForReply(prompt);
  return reply || "ASSESSMENT: Monitoring timed out. Will retry next session.\nSTATUS: monitoring\nNEW FINDINGS: none";
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
 */
export async function draftIntervention(
  conflictSummary: string,
  participantNames: string[],
  patternMatch?: string
): Promise<string> {
  const prompt = `I need your help with a community intervention. A conflict in the Pixel Forge community has escalated and I think someone should reach out to the members involved.

Here's what's happening:
- Participants: ${participantNames.join(" vs ")}
- What's going on: ${conflictSummary}
${patternMatch ? `- This reminds me of a prior pattern: ${patternMatch}` : ""}

Could you draft a message I could post in the community channel? I want it to:
- Feel genuine, not corporate
- Acknowledge that both people have a valid perspective
- Suggest a way forward without lecturing either of them
- Come from someone who clearly cares about the community

Just the message text, ready to post. Be yourself.`;

  const reply = await sendAndWaitForReply(prompt, 240000);
  return reply || "Unable to draft intervention at this time. Please try again.";
}

/**
 * Check the cognition balance before running a monitoring session or recording.
 */
export async function checkCognitionBalance(): Promise<number> {
  const client = getMindsClient();
  const balance = await client.getCognitionBalance(MIND_ID);
  return balance.cognition;
}

/**
 * Parse the Mind's conversation history into structured monitoring sessions for the UI.
 * Each pair of (Human prompt + Mind reply) = one monitoring session.
 */
export interface ParsedSession {
  sessionNumber: number;
  prompt: string;
  reply: string;
  timestamp: string;
}

export function parseHistoryToSessions(history: MessageRecord[]): ParsedSession[] {
  // History is most-recent-first. Reverse to chronological.
  const chronological = [...history].reverse();

  const sessions: ParsedSession[] = [];
  let currentPrompt: string | null = null;
  let currentTimestamp: string = "";

  for (const record of chronological) {
    const isMind = record.senderType === 0 || record.senderType === 2;
    const text = (record.messageText || "").replace(/<[^>]*>/g, "");

    if (!isMind) {
      // Human message — this is a monitoring prompt
      currentPrompt = text;
      currentTimestamp = record.createdAt || "";
    } else if (currentPrompt) {
      // Mind reply — pair it with the prompt
      sessions.push({
        sessionNumber: sessions.length + 1,
        prompt: currentPrompt,
        reply: text,
        timestamp: currentTimestamp,
      });
      currentPrompt = null;
    }
  }

  return sessions;
}

export { MONITORING_ALIAS };
