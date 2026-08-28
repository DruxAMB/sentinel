import type { CommunityData, Member, Message, ConflictWatch, ConflictInteraction, MonitoringSession } from "./types";

// Sentinel seed data — a Discord-style creator community called "Pixel Forge"
// The primary conflict: @Alex vs @Jordan, escalating over 12 days
// The pattern match: @Chris vs @Sam (3 weeks ago, escalated to a ban)
//
// All messages are written to read like a real community — natural language,
// plausible disagreement topics (creative feedback, not politics), gradual
// escalation that a human moderator would likely miss until it's too late.

const members: Member[] = [
  {
    id: "m_alex",
    name: "Alex Chen",
    handle: "@alex",
    avatarColor: "#3b82f6",
    avatarImg: 12,
    gender: "male",
    joinedDaysAgo: 180,
    role: "regular",
  },
  {
    id: "m_jordan",
    name: "Jordan Vale",
    handle: "@jordan",
    avatarColor: "#a855f7",
    avatarImg: 5,
    gender: "female",
    joinedDaysAgo: 210,
    role: "regular",
  },
  {
    id: "m_chris",
    name: "Chris Park",
    handle: "@chris",
    avatarColor: "#22c55e",
    avatarImg: 13,
    gender: "male",
    joinedDaysAgo: 300,
    role: "member",
  },
  {
    id: "m_sam",
    name: "Sam Rivera",
    handle: "@sam",
    avatarColor: "#f97316",
    avatarImg: 9,
    gender: "female",
    joinedDaysAgo: 280,
    role: "member",
  },
  {
    id: "m_taylor",
    name: "Taylor Kim",
    handle: "@taylor",
    avatarColor: "#ec4899",
    avatarImg: 20,
    gender: "female",
    joinedDaysAgo: 90,
    role: "member",
  },
  {
    id: "m_morgan",
    name: " Morgan Lee",
    handle: "@morgan",
    avatarColor: "#14b8a6",
    avatarImg: 25,
    gender: "female",
    joinedDaysAgo: 150,
    role: "moderator",
  },
  {
    id: "m_riley",
    name: "Riley Zhang",
    handle: "@riley",
    avatarColor: "#6366f1",
    avatarImg: 32,
    gender: "female",
    joinedDaysAgo: 60,
    role: "member",
  },
  {
    id: "m_casey",
    name: "Casey Wu",
    handle: "@casey",
    avatarColor: "#f87171",
    avatarImg: 33,
    gender: "male",
    joinedDaysAgo: 45,
    role: "member",
  },
  {
    id: "m_drew",
    name: "Drew Patel",
    handle: "@drew",
    avatarColor: "#eab308",
    avatarImg: 51,
    gender: "male",
    joinedDaysAgo: 120,
    role: "regular",
  },
  {
    id: "m_sky",
    name: "Sky Okafor",
    handle: "@sky",
    avatarColor: "#06b6d4",
    avatarImg: 53,
    gender: "male",
    joinedDaysAgo: 30,
    role: "member",
  },
  {
    id: "m_robin",
    name: "Robin Hale",
    handle: "@robin",
    avatarColor: "#f43f5e",
    avatarImg: 60,
    gender: "male",
    joinedDaysAgo: 200,
    role: "regular",
  },
  {
    id: "m_jamie",
    name: "Jamie Frost",
    handle: "@jamie",
    avatarColor: "#65a30d",
    avatarImg: 45,
    gender: "female",
    joinedDaysAgo: 15,
    role: "member",
  },
];

// --- The primary conflict: Alex vs Jordan ---
// Topic: disagreement over pixel art technique feedback in #feedback
// Day 1: neutral disagreement about approach
// Day 5: frustrated — the same argument resurfaces, tones sharpen
// Day 9-12: hostile — personal jabs, other members notice

const messages: Message[] = [
  // --- Day 12 (most recent) ---
  {
    id: "msg_001",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "Honestly at this point you're just dismissing everything I say because it's me saying it. I've been doing this for 6 years and you treat me like I don't know what a palette is.",
    timestamp: "2026-08-24T14:22:00Z",
    daysAgo: 0,
    tone: "hostile",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_002",
    authorId: "m_alex",
    channel: "#feedback",
    content: "Maybe if your feedback wasn't always condescending people would actually listen. You don't critique the work, you critique the person making it.",
    timestamp: "2026-08-24T14:31:00Z",
    daysAgo: 0,
    tone: "hostile",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_003",
    authorId: "m_taylor",
    channel: "#feedback",
    content: "Hey can we maybe take a breath? This thread has been going in circles for a week.",
    timestamp: "2026-08-24T14:35:00Z",
    daysAgo: 0,
    tone: "neutral",
  },
  {
    id: "msg_004",
    authorId: "m_riley",
    channel: "#general",
    content: "Has anyone else noticed the #feedback channel has been kinda tense lately? I just lurk there but it's uncomfortable to read.",
    timestamp: "2026-08-24T16:10:00Z",
    daysAgo: 0,
    tone: "neutral",
  },

  // --- Day 11 ---
  {
    id: "msg_005",
    authorId: "m_drew",
    channel: "#general",
    content: "Posted a new WIP in #feedback, would love thoughts from the regulars",
    timestamp: "2026-08-23T10:00:00Z",
    daysAgo: 1,
    tone: "neutral",
  },
  {
    id: "msg_006",
    authorId: "m_sky",
    channel: "#general",
    content: "New here! Excited to learn from everyone. Been doing pixel art for about 2 months.",
    timestamp: "2026-08-23T11:30:00Z",
    daysAgo: 1,
    tone: "warm",
  },
  {
    id: "msg_007",
    authorId: "m_morgan",
    channel: "#general",
    content: "Welcome @sky! Check the pinned messages in #feedback for the style guide. Great group here.",
    timestamp: "2026-08-23T11:45:00Z",
    daysAgo: 1,
    tone: "warm",
  },

  // --- Day 9 — the third flagged interaction (frustrated tipping toward hostile) ---
  {
    id: "msg_008",
    authorId: "m_alex",
    channel: "#feedback",
    content: "Look, I already explained why limited palettes force better decisions. You keep coming back with 'but more colors looks better' like I didn't just lay out the reasoning. Are you even reading my replies?",
    timestamp: "2026-08-22T18:15:00Z",
    daysAgo: 2,
    tone: "hostile",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_009",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "I read them. I just disagree. Not everything is about your 'reasoning' — some of us have different aesthetics and that's valid. You don't own pixel art.",
    timestamp: "2026-08-22T18:22:00Z",
    daysAgo: 2,
    tone: "defensive",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_010",
    authorId: "m_robin",
    channel: "#feedback",
    content: "For what it's worth I think both approaches have merit. Alex's constraint argument is solid but Jordan's color-sensitivity point is real too. Different strokes.",
    timestamp: "2026-08-22T18:40:00Z",
    daysAgo: 2,
    tone: "neutral",
  },

  // --- Day 7 ---
  {
    id: "msg_011",
    authorId: "m_casey",
    channel: "#feedback",
    content: "Tried the 4-color palette challenge from last week. Really pushed me. Sharing results below!",
    timestamp: "2026-08-20T09:00:00Z",
    daysAgo: 4,
    tone: "warm",
  },
  {
    id: "msg_012",
    authorId: "m_jamie",
    channel: "#general",
    content: "What software do most people use here? Coming from Aseprite, wondering if there's something better for animation.",
    timestamp: "2026-08-20T14:00:00Z",
    daysAgo: 4,
    tone: "neutral",
  },
  {
    id: "msg_013",
    authorId: "m_drew",
    channel: "#general",
    content: "Aseprite is the standard. Some use Pro Motion NG for advanced stuff. Stay with Aseprite for now.",
    timestamp: "2026-08-20T14:15:00Z",
    daysAgo: 4,
    tone: "neutral",
  },

  // --- Day 5 — the second flagged interaction (frustrated) ---
  {
    id: "msg_014",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "We literally had this conversation 4 days ago. I said palette size depends on the piece and you insisted limited is always better. Now you're saying the same thing again on someone else's work. I'm not doing this again.",
    timestamp: "2026-08-18T20:30:00Z",
    daysAgo: 6,
    tone: "frustrated",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_015",
    authorId: "m_alex",
    channel: "#feedback",
    content: "I'm saying it again because you keep posting work that would benefit from it and then ignoring the feedback. If you don't want critique maybe don't post in #feedback?",
    timestamp: "2026-08-18T20:45:00Z",
    daysAgo: 6,
    tone: "frustrated",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_016",
    authorId: "m_taylor",
    channel: "#feedback",
    content: "Both of you have good points honestly. Maybe we can frame it as 'here's why I'd go limited' vs 'here's why I'd go wider' without the back and forth?",
    timestamp: "2026-08-18T21:00:00Z",
    daysAgo: 6,
    tone: "neutral",
  },

  // --- Day 3 ---
  {
    id: "msg_017",
    authorId: "m_robin",
    channel: "#general",
    content: "Weekly challenge idea: draw a scene using only 3 colors. Who's in?",
    timestamp: "2026-08-16T10:00:00Z",
    daysAgo: 8,
    tone: "playful",
  },
  {
    id: "msg_018",
    authorId: "m_sky",
    channel: "#general",
    content: "That sounds fun! I'll try even though I'm still learning.",
    timestamp: "2026-08-16T10:30:00Z",
    daysAgo: 8,
    tone: "warm",
  },
  {
    id: "msg_019",
    authorId: "m_morgan",
    channel: "#general",
    content: "Love this. I'll pin the submissions thread. Deadline Sunday?",
    timestamp: "2026-08-16T11:00:00Z",
    daysAgo: 8,
    tone: "warm",
  },

  // --- Day 1 — the first flagged interaction (neutral disagreement) ---
  {
    id: "msg_020",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "Posted a new piece — went with a wider 12-color palette for this one. Wanted the sunset gradient to feel smooth. Thoughts?",
    timestamp: "2026-08-14T19:00:00Z",
    daysAgo: 10,
    tone: "neutral",
  },
  {
    id: "msg_021",
    authorId: "m_alex",
    channel: "#feedback",
    content: "Honestly I think 12 colors is overkill for this scale. The sunset reads fine with 5-6 if you cluster them well. More colors often means you're compensating for weak value structure.",
    timestamp: "2026-08-14T19:15:00Z",
    daysAgo: 10,
    tone: "neutral",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_022",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "Hmm, I get that take but I deliberately wanted the gradient smoothness. Sometimes more colors is the point, not a crutch. Different approach, not a wrong one.",
    timestamp: "2026-08-14T19:22:00Z",
    daysAgo: 10,
    tone: "neutral",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_023",
    authorId: "m_alex",
    channel: "#feedback",
    content: "Fair enough. I'd still push you to try it with 6 and see if the gradient holds up. Constraint usually reveals what's actually working.",
    timestamp: "2026-08-14T19:30:00Z",
    daysAgo: 10,
    tone: "neutral",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_024",
    authorId: "m_jordan",
    channel: "#feedback",
    content: "Maybe. I'll experiment with it next piece. Appreciate the perspective.",
    timestamp: "2026-08-14T19:35:00Z",
    daysAgo: 10,
    tone: "neutral",
    conflictId: "c_alex_jordan",
    isFlaggedInteraction: true,
  },

  // --- Day 0 (12 days ago) — context messages, no conflict ---
  {
    id: "msg_025",
    authorId: "m_drew",
    channel: "#feedback",
    content: "Finished my isometric city piece. Took 3 weeks. Really proud of the lighting on the waterfront.",
    timestamp: "2026-08-12T15:00:00Z",
    daysAgo: 12,
    tone: "warm",
  },
  {
    id: "msg_026",
    authorId: "m_casey",
    channel: "#general",
    content: "Does anyone have good references for cyberpunk pixel environments? Working on a personal project.",
    timestamp: "2026-08-12T16:00:00Z",
    daysAgo: 12,
    tone: "neutral",
  },
  {
    id: "msg_027",
    authorId: "m_robin",
    channel: "#general",
    content: "Check the old Hyper Light Drifter dev logs. Also the Satish Padmanabhan thread on environment palettes.",
    timestamp: "2026-08-12T16:20:00Z",
    daysAgo: 12,
    tone: "neutral",
  },

  // --- Past conflict: Chris vs Sam (3 weeks ago, escalated to a ban) ---
  // These are referenced by the Mind as the pattern match — not shown in the
  // main feed, but visible in the conflict detail as "prior pattern"
  {
    id: "msg_028",
    authorId: "m_chris",
    channel: "#feedback",
    content: "This is the third time you've posted 'just add more detail' as feedback. It's not helpful, it's lazy. Say something specific or don't say anything.",
    timestamp: "2026-07-28T22:00:00Z",
    daysAgo: 27,
    tone: "hostile",
    conflictId: "c_chris_sam",
    isFlaggedInteraction: true,
  },
  {
    id: "msg_029",
    authorId: "m_sam",
    channel: "#feedback",
    content: "Oh I'm lazy? You post the same anime girl in 4 colors every week and act like it's groundbreaking. At least I engage with people's work.",
    timestamp: "2026-07-28T22:10:00Z",
    daysAgo: 27,
    tone: "hostile",
    conflictId: "c_chris_sam",
    isFlaggedInteraction: true,
  },
];

// --- Conflict watches ---

const conflicts: ConflictWatch[] = [
  {
    id: "c_alex_jordan",
    participantIds: ["m_alex", "m_jordan"],
    status: "active",
    priority: "high",
    firstDetectedDaysAgo: 10,
    lastInteractionDaysAgo: 0,
    interactionCount: 3,
    trajectory: ["neutral", "frustrated", "hostile"],
    summary:
      "Disagreement over palette philosophy in #feedback. Started as a legitimate creative difference about color count, escalated into personal dismissiveness over 12 days. Both members are established regulars with 6+ months tenure.",
    patternMatch: {
      priorConflictId: "c_chris_sam",
      priorParticipantNames: ["Chris Park", "Sam Rivera"],
      similarity:
        "Same trajectory: neutral creative disagreement → frustrated repetition of the same argument → hostile personal attacks. Same channel (#feedback). Same tenure profile (both regulars, 6+ months). The Chris/Sam conflict escalated to a ban over 18 days; this one is on the same path at day 12.",
    },
    draftedIntervention: {
      content:
        "Hey @alex and @jordan — I've noticed the palette discussion in #feedback has gotten tense over the past couple weeks. You both clearly care a lot about the craft, which is exactly what makes this community good. The limited-palette and wide-palette approaches are both legitimate and the community benefits from both perspectives being shared. Could we try framing feedback as 'here's why I'd choose X' rather than 'you should choose X'? I'd love to see both of you keep contributing without the friction. Happy to chat more if either of you wants to.",
      draftedAtDaysAgo: 0,
      tone: "Empathetic, non-accusatory, acknowledges both perspectives, suggests a concrete reframing",
    },
  },
  {
    id: "c_chris_sam",
    participantIds: ["m_chris", "m_sam"],
    status: "resolved",
    priority: "high",
    firstDetectedDaysAgo: 27,
    lastInteractionDaysAgo: 21,
    interactionCount: 4,
    trajectory: ["neutral", "frustrated", "hostile", "hostile"],
    summary:
      "Disagreement over feedback quality in #feedback. Chris felt Sam's feedback was generic; Sam felt Chris was dismissive of their work. Escalated to personal attacks over 18 days. Resulted in Sam being banned after a final hostile exchange in DMs (reported by Chris). Chris remains in the community but has been less active since.",
  },
  {
    id: "c_riley_taylor",
    participantIds: ["m_riley", "m_taylor"],
    status: "monitoring",
    priority: "low",
    firstDetectedDaysAgo: 3,
    lastInteractionDaysAgo: 1,
    interactionCount: 1,
    trajectory: ["neutral"],
    summary:
      "Minor tension in #general over weekly challenge formatting preferences. Both members were polite. No escalation detected. Monitoring in case it recurs.",
  },
];

// --- Flagged interactions (the exchanges the Mind identified as conflict markers) ---

const interactions: ConflictInteraction[] = [
  {
    id: "int_001",
    conflictId: "c_alex_jordan",
    participantIds: ["m_alex", "m_jordan"],
    messageIds: ["msg_020", "msg_021", "msg_022", "msg_023", "msg_024"],
    daysAgo: 10,
    tone: "neutral",
    summary:
      "Jordan posts a 12-color palette piece. Alex critiques the color count as overkill. Jordan disagrees but politely. Both end with 'appreciate the perspective' — a normal creative disagreement.",
  },
  {
    id: "int_002",
    conflictId: "c_alex_jordan",
    participantIds: ["m_alex", "m_jordan"],
    messageIds: ["msg_014", "msg_015"],
    daysAgo: 6,
    tone: "frustrated",
    summary:
      "The same palette argument resurfaces on another member's work. Jordan references the prior exchange ('we literally had this conversation 4 days ago'). Alex implies Jordan shouldn't post in #feedback if they don't want critique. Tone shifts from disagreement to personal framing.",
  },
  {
    id: "int_003",
    conflictId: "c_alex_jordan",
    participantIds: ["m_alex", "m_jordan"],
    messageIds: ["msg_008", "msg_009", "msg_010"],
    daysAgo: 2,
    tone: "hostile",
    summary:
      "Alex questions whether Jordan is even reading their replies. Jordan accuses Alex of acting like they own pixel art. Robin attempts to mediate. The argument has moved from palette philosophy to personal competence and ownership.",
  },
  {
    id: "int_004",
    conflictId: "c_alex_jordan",
    participantIds: ["m_alex", "m_jordan"],
    messageIds: ["msg_001", "msg_002", "msg_003"],
    daysAgo: 0,
    tone: "hostile",
    summary:
      "Jordan accuses Alex of dismissing everything because of who says it. Alex accuses Jordan of being condescending and critiquing the person, not the work. Taylor asks them to take a breath. Meanwhile, Riley mentions in #general that the channel has been tense — the conflict is now visible to lurkers.",
  },
];

// --- The Mind's monitoring sessions over 12 days ---
// This is the persistence proof — the Mind has been working across sessions,
// building its assessment over time. The trajectory of its assessment mirrors
// the trajectory of the conflict.

const sessions: MonitoringSession[] = [
  {
    id: "sess_001",
    sessionNumber: 1,
    daysAgo: 10,
    duration: "~2 min",
    messagesAnalyzed: 8,
    assessment: "No conflict detected. Normal creative disagreement in #feedback between @alex and @jordan over palette approach. Both parties remained respectful. No action needed.",
    newFindings: ["New exchange in #feedback — palette philosophy disagreement (neutral tone)"],
    status: "no_conflict",
  },
  {
    id: "sess_002",
    sessionNumber: 2,
    daysAgo: 6,
    duration: "~3 min",
    messagesAnalyzed: 14,
    assessment: "Mild tension detected between @alex and @jordan. The same palette argument has resurfaced. Tone shifted from neutral to frustrated. @jordan referenced the prior exchange, suggesting pattern recognition on their side. @alex's framing ('if you don't want critique maybe don't post') is a boundary challenge. Monitoring.",
    newFindings: [
      "Repeat argument detected — same topic, same participants, 4 days apart",
      "Tone shift: neutral → frustrated",
      "@alex made a boundary-challenging statement about posting in #feedback",
    ],
    status: "monitoring",
  },
  {
    id: "sess_003",
    sessionNumber: 3,
    daysAgo: 2,
    duration: "~4 min",
    messagesAnalyzed: 22,
    assessment: "Tension escalating between @alex and @jordan. Third interaction in #feedback, now hostile tone. Personal competence questioned by both sides. @robin attempted mediation. This matches a prior conflict pattern: @chris vs @sam (27 days ago) followed the same neutral → frustrated → hostile trajectory in the same channel, resulting in a ban. Recommend close monitoring and prepare intervention.",
    newFindings: [
      "Third interaction — tone shifted to hostile",
      "Pattern match detected: trajectory mirrors @chris vs @sam conflict (resolved via ban)",
      "@robin attempted de-escalation; unsuccessful",
      "Lurker @riley noted tension in #general — conflict now visible to non-participants",
    ],
    status: "escalating",
  },
  {
    id: "sess_004",
    sessionNumber: 4,
    daysAgo: 0,
    duration: "~5 min",
    messagesAnalyzed: 27,
    assessment: "Conflict watch activated. Fourth interaction between @alex and @jordan, hostile tone sustained. Personal attacks exchanged ('you dismiss everything I say', 'you critique the person not the work'). @taylor attempted de-escalation. The conflict is now public — @riley raised it in #general. This conflict is on the same escalation path as @chris vs @sam, which ended in a ban at day 18. We are at day 12. Intervention recommended now, before the next escalation.",
    newFindings: [
      "Fourth interaction — hostile tone sustained, personal attacks exchanged",
      "Conflict now public: @riley raised tension in #general",
      "Trajectory matches @chris vs @sam at same stage — that conflict ended in a ban",
      "Drafted intervention message ready for review",
    ],
    status: "intervene",
  },
];

export const communityData: CommunityData = {
  communityName: "Pixel Forge",
  members,
  messages,
  conflicts,
  interactions,
  sessions,
};
