import "dotenv/config";
import path from "path";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { prisma } from "./prisma";
import { authRouter } from "./routes/auth";
import { donationsRouter } from "./routes/donations";
import { webhooksRouter } from "./routes/webhooks";
import { membershipsRouter } from "./routes/memberships";
import { membershipPlansRouter } from "./routes/membershipPlans";
import { paymentsRouter } from "./routes/payments";
import { reportsRouter } from "./routes/reports";
import { newsletterRouter } from "./routes/newsletter";
import { uploadsRouter } from "./routes/uploads";
import { eventsRouter, articlesRouter, newslettersRouter, boardRouter } from "./routes/content";
import { webinarsRouter } from "./routes/webinars";
import { conferenceVideosRouter } from "./routes/conferenceVideos";
import { asyncHandler } from "./lib/asyncHandler";
import { paymentsBypassed } from "./lib/paymentsBypass";
import { sendGridConfigured } from "./lib/mailer";

// Surface crashes that happen outside the request/response cycle (bad
// startup config, an unawaited rejected promise) instead of the process
// dying silently with no trace in the host's logs.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

const app = express();

// Logs every request that actually reaches this process, with its outcome —
// so "why isn't this API working" has a concrete first checkpoint: if a
// request never shows up here at all, the problem is upstream (DNS, firewall,
// reverse proxy) rather than in this app.
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const line = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`;
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else console.log(line);
  });
  next();
});

app.use(cors({ origin: process.env.WEB_ORIGIN }));

// Stripe needs the raw body to verify the webhook signature, so this is
// mounted before the global express.json() body parser below.
app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Test endpoint: hit this after deploying to confirm the API process is up,
// can actually reach the database, and see at a glance which optional
// integrations (Stripe/SendGrid) are configured vs still using placeholders —
// the exact reason a request "isn't working" is often one of these.
app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const config = {
      paymentsBypass: paymentsBypassed(),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY) && !process.env.STRIPE_SECRET_KEY?.includes("placeholder"),
      sendgridConfigured: sendGridConfigured,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, db: "connected", ...config, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("Health check DB query failed:", err);
      res.status(503).json({
        ok: false,
        db: "error",
        error: err instanceof Error ? err.message : "Unknown database error",
        ...config,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

app.use("/auth", authRouter);
app.use("/donations", donationsRouter);
app.use("/memberships", membershipsRouter);
app.use("/membership-plans", membershipPlansRouter);
app.use("/payments", paymentsRouter);
app.use("/reports", reportsRouter);
app.use("/newsletter", newsletterRouter);
app.use("/uploads", uploadsRouter);

// Content management (replaces the retired Strapi CMS)
app.use("/events", eventsRouter);
app.use("/webinars", webinarsRouter);
app.use("/conference-videos", conferenceVideosRouter);
app.use("/articles", articlesRouter);
app.use("/newsletters", newslettersRouter);
app.use("/board", boardRouter);

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`NAHCA API listening on http://localhost:${port}`);
});
