export type ContentTypeKey =
  | "events"
  | "webinars"
  | "conference-videos"
  | "articles"
  | "newsletters"
  | "board";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "date" | "time" | "number" | "checkbox" | "select" | "file";
  required?: boolean;
  options?: string[];
}

export interface ContentTypeConfig {
  key: ContentTypeKey;
  label: string;
  singularLabel: string;
  titleField: string;
  fields: FieldConfig[];
}

export const CONTENT_TYPES: Record<ContentTypeKey, ContentTypeConfig> = {
  events: {
    key: "events",
    label: "Events",
    singularLabel: "Event",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Time", type: "time" },
      { name: "description", label: "Description", type: "richtext" },
      { name: "registrationLink", label: "Registration Link", type: "text" },
      { name: "featuredImageUrl", label: "Featured Image", type: "file" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  webinars: {
    key: "webinars",
    label: "Webinars",
    singularLabel: "Webinar",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "zoomOrYoutubeLink", label: "Zoom / YouTube Link", type: "text" },
      { name: "priceCents", label: "Price in cents (blank = free)", type: "number" },
      { name: "speakerInfo", label: "Speaker Info", type: "textarea" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  "conference-videos": {
    key: "conference-videos",
    label: "Conference Videos",
    singularLabel: "Conference Video",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "videoUrl", label: "Video URL", type: "text", required: true },
      { name: "year", label: "Year", type: "number" },
      { name: "category", label: "Category", type: "text" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  articles: {
    key: "articles",
    label: "Articles",
    singularLabel: "Article",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "richTextBody", label: "Body", type: "textarea" },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: ["Podcast", "Presentation", "Referral", "Ethics"],
      },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  newsletters: {
    key: "newsletters",
    label: "Newsletters",
    singularLabel: "Newsletter",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "fileUrl", label: "PDF / File", type: "file" },
      { name: "mailchimpCampaignUrl", label: "Mailchimp Campaign URL", type: "text" },
      { name: "publishedDate", label: "Published Date", type: "date" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  board: {
    key: "board",
    label: "Board Members",
    singularLabel: "Board Member",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role / Title", type: "text" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photoUrl", label: "Photo", type: "file" },
      { name: "order", label: "Display Order", type: "number" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
};
