import { z } from "zod";
import { prisma } from "../prisma";
import { createContentRouter } from "../lib/contentRouter";

const dateInput = z.coerce.date();

export const eventsRouter = createContentRouter({
  delegate: prisma.event,
  schema: z.object({
    title: z.string().min(1),
    date: dateInput,
    time: z.string().optional(),
    description: z.string().optional(),
    registrationLink: z.string().optional(),
    featuredImageUrl: z.string().nullable().optional(),
    published: z.boolean().optional(),
  }),
  orderBy: { date: "asc" },
});

export const articlesRouter = createContentRouter({
  delegate: prisma.article,
  schema: z.object({
    title: z.string().min(1),
    richTextBody: z.string().optional(),
    category: z.enum(["Podcast", "Presentation", "Referral", "Ethics"]),
    published: z.boolean().optional(),
  }),
  orderBy: { createdAt: "desc" },
});

export const newslettersRouter = createContentRouter({
  delegate: prisma.newsletter,
  schema: z.object({
    title: z.string().min(1),
    fileUrl: z.string().nullable().optional(),
    mailchimpCampaignUrl: z.string().optional(),
    publishedDate: dateInput.optional(),
    published: z.boolean().optional(),
  }),
  orderBy: { createdAt: "desc" },
});

export const boardRouter = createContentRouter({
  delegate: prisma.board,
  schema: z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    bio: z.string().optional(),
    photoUrl: z.string().nullable().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
  }),
  orderBy: { order: "asc" },
});
