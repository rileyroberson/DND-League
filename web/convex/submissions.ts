import { mutation } from "convex/server";
import { v } from "convex/values";

function parseHHMMToMinutes(hhmm: string): number | null {
  const match = hhmm.match(/^([0-9]{1,3}):([0-5][0-9])$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export const submitManual = mutation({
  args: { leagueId: v.id("leagues"), weekId: v.id("weeks"), hhmm: v.string() },
  handler: async (ctx, args) => {
    const minutes = parseHHMMToMinutes(args.hhmm);
    if (minutes === null) throw new Error("Invalid HH:MM");
    const userId = ctx.auth.getUserIdentity()?.subject;
    if (!userId) throw new Error("Unauthorized");
    // For a real app, look up the Convex user doc by auth subject.
    const submissionId = await ctx.db.insert("submissions", {
      leagueId: args.leagueId,
      weekId: args.weekId,
      userId: undefined as any, // TODO: map auth subject to users table
      source: "manual",
      minutes,
      status: "confirmed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { submissionId };
  },
});
