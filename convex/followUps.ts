import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("followUps")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

export const markQueued = mutation({
  args: { followUpId: v.id("followUps") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.followUpId, { status: "queued" });
  },
});
