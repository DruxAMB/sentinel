/**
 * Telegram Bot API integration for Sentinel.
 *
 * Fetches real messages from a Telegram group via the Bot API.
 * The bot must be added to the group and have read permissions.
 *
 * API docs: https://core.telegram.org/bots/api
 */

export interface TelegramMessage {
  messageId: number;
  author: string;
  authorId: string;
  content: string;
  timestamp: string; // ISO
  chatId: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    chat: { id: number; title?: string };
    from?: { id: number; first_name?: string; last_name?: string; username?: string };
    text?: string;
  };
}

/**
 * Fetch recent messages from a Telegram group via getUpdates.
 * Returns messages in chronological order (oldest first).
 */
export async function fetchTelegramMessages(
  botToken: string,
  chatId: string,
  limit = 50
): Promise<TelegramMessage[]> {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  // getUpdates returns recent updates (messages sent to the bot)
  // We use offset=-limit to get the last N updates
  const res = await fetch(`${baseUrl}/getUpdates?limit=100&offset=-100`);
  if (!res.ok) {
    throw new Error(`Telegram API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API returned error: ${data.description || "unknown"}`);
  }

  const updates = data.result as TelegramUpdate[];

  // Filter to messages in our target chat, with text content
  const messages = updates
    .filter((u) => u.message && u.message.chat && u.message.chat.id.toString() === chatId && u.message.text)
    .map((u) => {
      const msg = u.message!;
      const from = msg.from;
      const author = from
        ? [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || "Unknown"
        : "Unknown";
      return {
        messageId: msg.message_id,
        author,
        authorId: from?.id?.toString() || "unknown",
        content: msg.text!,
        timestamp: new Date(msg.date * 1000).toISOString(),
        chatId: msg.chat.id.toString(),
      };
    });

  // Return in chronological order (oldest first), limited
  return messages.slice(-limit);
}

/**
 * Get info about the bot (for verification).
 */
export async function getTelegramBotInfo(botToken: string): Promise<{ name: string; username: string }> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description || "invalid token"}`);
  }
  return {
    name: `${data.result.first_name || ""}`,
    username: data.result.username || "",
  };
}

/**
 * Get info about a chat (group name, member count).
 */
export async function getTelegramChatInfo(
  botToken: string,
  chatId: string
): Promise<{ title: string; memberCount: number }> {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  const [chatRes, countRes] = await Promise.all([
    fetch(`${baseUrl}/getChat?chat_id=${chatId}`),
    fetch(`${baseUrl}/getChatMemberCount?chat_id=${chatId}`),
  ]);

  const chatData = await chatRes.json();
  const countData = await countRes.json();

  return {
    title: chatData.ok ? chatData.result.title || "Telegram Group" : "Telegram Group",
    memberCount: countData.ok ? countData.result : 0,
  };
}
