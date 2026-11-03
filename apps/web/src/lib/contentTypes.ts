export type ContentTypeKey =
  | "events"
  | "webinars"
  | "conference-videos"
  | "articles"
  | "newsletters"
  | "board"
  | "partners"
  | "academic-papers"
  | "resource-websites"
  | "podcasts"
  | "resource-videos";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "richtext"
    | "date"
    | "time"
    | "number"
    | "currency"
    | "checkbox"
    | "select"
    | "file"
    | "speakers";
  required?: boolean;
  // For "file" fields: what the picker offers and what its button says.
  accept?: string;
  uploadLabel?: string;
  options?: (string | SelectOption)[];
  helpText?: string;
}

export interface ContentTypeConfig {
  key: ContentTypeKey;
  label: string;
  singularLabel: string;
  titleField: string;
  fields: FieldConfig[];
  // New items start with Published ticked (used where a draft would just look
  // like "my item isn't showing on the website").
  defaultPublished?: boolean;
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
      {
        name: "priceCents",
        label: "Event Fee (USD)",
        type: "currency",
        helpText: "Leave blank for a free event.",
      },
      {
        name: "featuredImageUrl",
        label: "Featured Image",
        type: "file",
        helpText: "Recommended size: 600 × 300px.",
      },
      { name: "speakers", label: "Speakers", type: "speakers" },
      {
        name: "access",
        label: "Visibility",
        type: "select",
        required: true,
        options: [
          { value: "open", label: "Open (visible on the website)" },
          { value: "members_only", label: "Members Only (visible in the member portal)" },
        ],
      },
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
      {
        name: "date",
        label: "Date",
        type: "date",
        helpText: "Attendees are emailed a reminder 3 days before this date. A webinar with no date gets no reminder.",
      },
      { name: "time", label: "Time", type: "time" },
      { name: "description", label: "Description", type: "richtext" },
      { name: "zoomOrYoutubeLink", label: "Zoom / YouTube Link", type: "text" },
      {
        name: "priceCents",
        label: "Event Fee (USD)",
        type: "currency",
        helpText: "Leave blank for a free webinar.",
      },
      { name: "speakers", label: "Speakers", type: "speakers" },
      {
        name: "featuredImageUrl",
        label: "Featured Image",
        type: "file",
        helpText: "Shown as a square card on the webinars list, and a 600 × 300px banner on the webinar's own page.",
      },
      {
        name: "access",
        label: "Visibility",
        type: "select",
        required: true,
        options: [
          { value: "open", label: "Open (visible on the website)" },
          { value: "members_only", label: "Members Only (visible in the member portal)" },
        ],
      },
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
      {
        name: "videoFileUrl",
        label: "Upload Video",
        type: "file",
        accept: "video/mp4,video/webm,video/quicktime",
        uploadLabel: "Upload Video",
        helpText: "MP4 recommended, up to 50 MB. For a bigger video, use the link or embed code below instead.",
      },
      { name: "videoUrl", label: "Video Link (optional)", type: "text", helpText: "YouTube or Vimeo link." },
      {
        name: "embedCode",
        label: "Embed Code (optional)",
        type: "textarea",
        helpText: "Paste the <iframe> embed code. An uploaded video is played first, then the embed code, then the link.",
      },
      {
        name: "thumbnailUrl",
        label: "Thumbnail Image",
        type: "file",
        accept: "image/*",
        helpText: "Shown before an uploaded video plays. 1280 × 720 (16:9) works best.",
      },
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
      { name: "richTextBody", label: "Body", type: "richtext" },
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
  partners: {
    defaultPublished: true,
    key: "partners",
    label: "Organizational Partners",
    singularLabel: "Partner",
    titleField: "name",
    fields: [
      { name: "name", label: "Organization Name", type: "text", required: true },
      { name: "url", label: "Website URL", type: "text", required: true, helpText: "Full address, e.g. https://example.org/" },
      { name: "logoUrl", label: "Logo", type: "file", helpText: "Crop the image close to the logo — extra empty space makes it render small." },
      { name: "order", label: "Display Order", type: "number" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  "academic-papers": {
    defaultPublished: true,
    key: "academic-papers",
    label: "Academic Papers",
    singularLabel: "Academic Paper",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "fileUrl", label: "Upload PDF", type: "file", helpText: "PDF, up to 10 MB." },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  "resource-websites": {
    defaultPublished: true,
    key: "resource-websites",
    label: "Websites",
    singularLabel: "Website",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "linkUrl", label: "Website Link", type: "text", required: true, helpText: "Full address, e.g. https://example.org/" },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  podcasts: {
    defaultPublished: true,
    key: "podcasts",
    label: "Podcasts",
    singularLabel: "Podcast",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "linkUrl", label: "Podcast Link (optional)", type: "text", helpText: "YouTube or Vimeo link (or any page where it can be listened to)." },
      {
        name: "embedCode",
        label: "Embed Code (optional)",
        type: "textarea",
        helpText: "Paste the <iframe> embed code. Leave empty to embed automatically from a YouTube/Vimeo link.",
      },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
  "resource-videos": {
    defaultPublished: true,
    key: "resource-videos",
    label: "Videos",
    singularLabel: "Video",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "linkUrl", label: "Video Link (optional)", type: "text", helpText: "YouTube or Vimeo link." },
      {
        name: "embedCode",
        label: "Embed Code (optional)",
        type: "textarea",
        helpText: "Paste the <iframe> embed code. Leave empty to embed automatically from a YouTube/Vimeo link.",
      },
      { name: "published", label: "Published", type: "checkbox" },
    ],
  },
};

// The tabs on the admin Resources page, in order. Articles and Newsletters
// are older content types that already have their own forms — their tabs
// just reuse those.
export const RESOURCE_TAB_KEYS: ContentTypeKey[] = [
  "academic-papers",
  "resource-websites",
  "podcasts",
  "resource-videos",
  "articles",
  "newsletters",
];

// These are managed from the Resources page (under Website Content), not
// from a list page of their own: adding, editing and deleting one sends the
// admin back to its tab there, and they're left out of the Website Content
// menu and overview.
export function isResourceOnlyType(key: ContentTypeKey): boolean {
  return RESOURCE_TAB_KEYS.includes(key);
}

export function contentListPath(key: ContentTypeKey): string {
  return isResourceOnlyType(key) ? `/admin/content/resources?tab=${key}` : `/admin/content/${key}`;
}
