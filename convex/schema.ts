import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
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
    duplicateStatus: v.optional(v.union(v.literal("clear"), v.literal("possible_duplicate"))),
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
    crmProvider: v.optional(v.string()),
    crmExternalId: v.optional(v.string()),
    phoneContactStatus: v.optional(v.union(v.literal("queued"), v.literal("saved"), v.literal("failed"))),
    followUpChannel: v.union(v.literal("Text"), v.literal("Email")),
    followUpMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_email", ["email"]),
  syncEvents: defineTable({
    contactId: v.id("contacts"),
    provider: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("synced"),
      v.literal("failed"),
    ),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_contact", ["contactId"]),
  scanSessions: defineTable({
    ownerId: v.optional(v.string()),
    eventSource: v.optional(v.string()),
    frontImageId: v.optional(v.string()),
    backImageId: v.optional(v.string()),
    ocrStatus: v.union(v.literal("queued"), v.literal("processed"), v.literal("failed")),
    duplicateStatus: v.union(v.literal("clear"), v.literal("possible_duplicate")),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),
  exportJobs: defineTable({
    ownerId: v.optional(v.string()),
    format: v.union(v.literal("csv"), v.literal("contacts")),
    status: v.union(v.literal("queued"), v.literal("ready"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),
  followUps: defineTable({
    contactId: v.id("contacts"),
    channel: v.union(v.literal("Text"), v.literal("Email")),
    message: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  }).index("by_contact", ["contactId"]),
});
