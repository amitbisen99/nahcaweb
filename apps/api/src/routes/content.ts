import { z } from "zod";
import { prisma } from "../prisma";
import { createContentRouter } from "../lib/contentRouter";

const dateInput = z.coerce.date();

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
    publishedDate: dateInput.optional(),
    published: z.boolean().optional(),
  }),
  orderBy: { createdAt: "desc" },
});

export const partnersRouter = createContentRouter({
  delegate: prisma.partner,
  schema: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    logoUrl: z.string().nullable().optional(),
    order: z.number().int().optional(),
    published: z.boolean().optional(),
  }),
  orderBy: { order: "asc" },
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

// The Resources-library types all live in the Resource table, told apart by `kind`.
const resourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().nullable().optional(),
  linkUrl: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "Must start with http:// or https://")
    .optional(),
  embedCode: z.string().optional(),
  published: z.boolean().optional(),
});

function resourceRouter(kind: string) {
  return createContentRouter({
    delegate: prisma.resource,
    schema: resourceSchema,
    orderBy: { createdAt: "desc" },
    scope: { kind },
  });
}

export const academicPapersRouter = resourceRouter("academic_paper");
export const websitesRouter = resourceRouter("website");
export const podcastsRouter = resourceRouter("podcast");
export const videosRouter = resourceRouter("video");
