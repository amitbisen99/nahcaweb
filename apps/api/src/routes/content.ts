import { z } from "zod";
import { prisma } from "../prisma";
import { createContentRouter } from "../lib/contentRouter";

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
