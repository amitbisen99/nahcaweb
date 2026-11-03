import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const uploadsRouter = Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const MAX_FILE_BYTES = 10 * 1024 * 1024; // images and PDFs
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // matches the Server Action body limit in apps/web/next.config.ts
const VIDEO_FILE = /\.(mp4|webm|mov|m4v)$/i;

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpe?g|png|gif|webp|pdf)$/i.test(file.originalname) || VIDEO_FILE.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type — only images, PDFs and MP4/WebM/MOV videos are allowed"));
    }
  },
});

// multer rejects (too big, wrong type) by passing an error on — answer that with a
// 400 and its message rather than the default 500.
function acceptUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    const message = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE" ? "That file is too large — videos can be up to 50 MB" : err.message;
    res.status(400).json({ error: message || "Upload failed" });
  });
}

uploadsRouter.post("/", requireAuth, requireAdmin, acceptUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Only videos get the larger limit; multer's own limit is one number for all.
  if (req.file.size > MAX_FILE_BYTES && !VIDEO_FILE.test(req.file.originalname)) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "That file is too large — images and PDFs can be up to 10 MB" });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
