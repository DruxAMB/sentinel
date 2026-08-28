/**
 * Slack Web API integration for Sentinel.
 *
 * Fetches real messages from a Slack channel via the Web API.
 * The bot must be installed to the workspace and invited to the channel.
 *
 * API docs: https://api.slack.com/methods
 * No npm dependency — uses native fetch.
 */

export interface SlackMessage {
  messageId: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string; // ISO
  channelId: string;
}

interface SlackHistoryResponse {
  ok: boolean;
  messages?: Array<{
    ts: string;
    text: string;
    user: string;
    type: string;
    subtype?: string;
  }>;
  error?: string;
}

interface SlackUserInfo {
  ok: boolean;
  user?: {
    id: string;
    name: string;
    real_name?: string;
    profile?: { display_name?: string };
  };
  error?: string;
}

interface SlackChannelInfo {
  ok: boolean;
  channel?: {
    id: string;
    name: string;
    num_members?: number;
  };
  error?: string;
}

/**
 * Fetch recent messages from a Slack channel via conversations.history.
 * Returns messages in chronological order (oldest first).
 */
export async function fetchSlackMessages(
  botToken: string,
  channelId: string,
  limit = 50
): Promise<SlackMessage[]> {
  const res = await fetch(
    `https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  const data: SlackHistoryResponse = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error || "unknown"}`);
  }

  const rawMessages = data.messages || [];

  // Filter to human messages (skip bot messages, joins, etc.)
  const humanMessages = rawMessages.filter(
    (m) => m.type === "message" && !m.subtype && m.text && m.user
  );

  // Fetch user names in batch (cache to avoid duplicate calls)
  const userCache = new Map<string, string>();
  const messages: SlackMessage[] = [];

  for (const msg of humanMessages) {
    let author = userCache.get(msg.user);
    if (!author) {
      try {
        const userRes = await fetch(`https://slack.com/api/users.info?user=${msg.user}`, {
          headers: { Authorization: `Bearer ${botToken}` },
        });
        const userData: SlackUserInfo = await userRes.json();
        author =
          userData.user?.real_name ||
          userData.user?.profile?.display_name ||
          userData.user?.name ||
          "Unknown";
        userCache.set(msg.user, author);
      } catch {
        author = "Unknown";
        userCache.set(msg.user, author);
      }
    }

    messages.push({
      messageId: msg.ts,
      author,
      authorId: msg.user,
      content: msg.text,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
      channelId,
    });
  }

  // Slack returns newest-first; reverse to chronological
  return messages.reverse();
}

/**
 * Get info about a channel (name, member count).
 */
export async function getSlackChannelInfo(
  botToken: string,
  channelId: string
): Promise<{ title: string; memberCount: number }> {
  const res = await fetch(
    `https://slack.com/api/conversations.info?channel=${channelId}`,
    {
      headers: { Authorization: `Bearer ${botToken}` },
    }
  );

  const data: SlackChannelInfo = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error || "unknown"}`);
  }

  return {
    title: data.channel?.name || "Slack Channel",
    memberCount: data.channel?.num_members || 0,
  };
}

/**
 * Validate a Slack bot token by calling auth.test.
 */
export async function validateSlackToken(botToken: string): Promise<{ valid: boolean; workspace?: string }> {
  const res = await fetch("https://slack.com/api/auth.test", {
    headers: { Authorization: `Bearer ${botToken}` },
  });
  const data = await res.json();
  return {
    valid: data.ok,
    workspace: data.team,
  };
}
