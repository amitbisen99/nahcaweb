export type ContentTypeKey =
  | "events"
  | "webinars"
  | "conference-videos"
  | "board"
  | "partners";

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
  board: {
    key: "board",
    label: "Board Members",
    singularLabel: "Board Member",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role / Title", type: "text" },
      { name: "bio", label: "Bio", type: "textarea" },
      {
        name: "photoUrl",
        label: "Photo",
        type: "file",
        helpText:
          "Dimensions: 720 × 900 px (4:5 portrait). You can upload photos up to 10MB but for quick page load use images under 500KB.",
      },
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
};

export function contentListPath(key: ContentTypeKey): string {
  return `/admin/content/${key}`;
}
