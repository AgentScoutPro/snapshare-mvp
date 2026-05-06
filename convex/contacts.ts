import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const contactFields = {
  ownerId: v.optional(v.string()),
  name: v.string(),
  title: v.optional(v.string()),
  company: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  source: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  ownerName: v.optional(v.string()),
  notes: v.optional(v.string()),
  crmStage: v.optional(v.string()),
  pipeline: v.optional(v.string()),
  opportunityStage: v.optional(v.string()),
  opportunityValue: v.optional(v.number()),
  leadStatus: v.optional(v.string()),
  followUpDate: v.optional(v.string()),
  consentStatus: v.union(
    v.literal("Confirmed"),
    v.literal("Needs consent"),
    v.literal("Skip follow-up"),
  ),
  followUpChannel: v.union(v.literal("Text"), v.literal("Email")),
  followUpMessage: v.optional(v.string()),
};

export const list = query({
  args: { ownerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.ownerId) {
      return await ctx.db.query("contacts").order("desc").take(25);
    }

    return await ctx.db
      .query("contacts")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .take(25);
  },
});

export const createFromScan = mutation({
  args: contactFields,
  handler: async (ctx, args) => {
    const now = Date.now();
    const contactId = await ctx.db.insert("contacts", {
      ...args,
      crmProvider: "GoHighLevel",
      duplicateStatus: "clear",
      phoneContactStatus: "queued",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("syncEvents", {
      contactId,
      provider: "GoHighLevel",
      status: "queued",
      message: "Contact queued for CRM sync.",
      createdAt: now,
    });

    await ctx.db.insert("followUps", {
      contactId,
      channel: args.followUpChannel,
      message: args.followUpMessage ?? "",
      status: "draft",
      createdAt: now,
    });

    return contactId;
  },
});
