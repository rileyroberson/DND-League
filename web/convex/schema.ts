import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  leagues: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    ownerUserId: v.id("users"),
    timezone: v.string(),
    createdAt: v.number(),
  })
    .index("by_invite", ["inviteCode"])
    .index("by_owner", ["ownerUserId"]),

  leagueMembers: defineTable({
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    role: v.string(),
    joinedAt: v.number(),
  })
    .index("by_league", ["leagueId"])
    .index("by_user", ["userId"])
    .index("by_league_user", ["leagueId", "userId"]),

  weeks: defineTable({
    leagueId: v.id("leagues"),
    weekNumber: v.number(),
    startAt: v.number(),
    endAt: v.number(),
    dueAt: v.number(),
    isLocked: v.boolean(),
  })
    .index("by_league_week", ["leagueId", "weekNumber"])
    .index("by_league", ["leagueId"]),

  submissions: defineTable({
    leagueId: v.id("leagues"),
    weekId: v.id("weeks"),
    userId: v.id("users"),
    source: v.string(),
    minutes: v.number(),
    imageUrl: v.optional(v.string()),
    geminiExtract: v.optional(v.any()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_week_user", ["weekId", "userId"])
    .index("by_league_week", ["leagueId", "weekId"])
    .index("by_user", ["userId"]),

  standings: defineTable({
    weekId: v.id("weeks"),
    leagueId: v.id("leagues"),
    userId: v.id("users"),
    rank: v.number(),
    points: v.number(),
    minutes: v.number(),
    createdAt: v.number(),
  })
    .index("by_week", ["weekId"])
    .index("by_league", ["leagueId"])
    .index("by_user", ["userId"]),
});
