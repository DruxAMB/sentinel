import { NextRequest, NextResponse } from "next/server";
import { fetchTelegramMessages, getTelegramChatInfo } from "@/lib/telegram";
import { fetchSlackMessages, getSlackChannelInfo, validateSlackToken } from "@/lib/slack";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ConnectedMessage {
  messageId: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string;
}

interface ConnectedCommunity {
  platform: "telegram" | "slack";
  communityName: string;
  memberCount: number;
  messages: ConnectedMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, botToken, chatId } = body;

    if (!platform || !botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: platform, botToken, chatId" },
        { status: 400 }
      );
    }

    if (platform === "telegram") {
      // Fetch messages and chat info from Telegram
      const [messages, chatInfo] = await Promise.all([
        fetchTelegramMessages(botToken, chatId, 50),
        getTelegramChatInfo(botToken, chatId).catch(() => ({
          title: "Telegram Group",
          memberCount: 0,
        })),
      ]);

      if (messages.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No messages found. Make sure the bot is added to the group and has read permissions. Send some messages in the group and try again.",
        });
      }

      const community: ConnectedCommunity = {
        platform: "telegram",
        communityName: chatInfo.title,
        memberCount: chatInfo.memberCount,
        messages: messages.map((m) => ({
          messageId: m.messageId.toString(),
          author: m.author,
          authorId: m.authorId,
          content: m.content,
          timestamp: m.timestamp,
        })),
      };

      return NextResponse.json({ success: true, community });
    }

    if (platform === "slack") {
      // Validate token first
      const validation = await validateSlackToken(botToken);
      if (!validation.valid) {
        return NextResponse.json({
          success: false,
          error: "Invalid Slack bot token. Make sure it starts with xoxb- and the app is installed to your workspace.",
        });
      }

      // Fetch messages and channel info
      const [messages, channelInfo] = await Promise.all([
        fetchSlackMessages(botToken, chatId, 50),
        getSlackChannelInfo(botToken, chatId).catch(() => ({
          title: "Slack Channel",
          memberCount: 0,
        })),
      ]);

      if (messages.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No messages found. Make sure the bot is invited to the channel and has channels:history scope. Send some messages in the channel and try again.",
        });
      }

      const community: ConnectedCommunity = {
        platform: "slack",
        communityName: `#${channelInfo.title}`,
        memberCount: channelInfo.memberCount,
        messages: messages.map((m) => ({
          messageId: m.messageId,
          author: m.author,
          authorId: m.authorId,
          content: m.content,
          timestamp: m.timestamp,
        })),
      };

      return NextResponse.json({ success: true, community });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported platform: ${platform}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Connection failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 200 });
  }
}
