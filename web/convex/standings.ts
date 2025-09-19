import { query } from "convex/server";

export const getWeekly = query({
  args: {},
  handler: async () => {
    // Placeholder query; will fetch computed standings later
    return [] as Array<{
      userId: string;
      minutes: number;
      rank: number;
      points: number;
    }>;
  },
});
