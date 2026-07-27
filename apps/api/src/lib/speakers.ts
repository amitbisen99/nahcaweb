import { z } from "zod";

// Shared by Events and Webinars — both support an optional list of speakers,
// each with a name, an optional title, and an optional photo (uploaded
// separately via /uploads, then referenced here by URL).
export const speakerSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
});

export const speakersSchema = z.array(speakerSchema).optional();
