import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { donationsRouter } from "./routes/donations";
import { webhooksRouter } from "./routes/webhooks";
import { membershipsRouter } from "./routes/memberships";
import { reportsRouter } from "./routes/reports";
import { newsletterRouter } from "./routes/newsletter";

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN }));

// Stripe needs the raw body to verify the webhook signature, so this is
// mounted before the global express.json() body parser below.
app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/donations", donationsRouter);
app.use("/memberships", membershipsRouter);
app.use("/reports", reportsRouter);
app.use("/newsletter", newsletterRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`NAHCA API listening on http://localhost:${port}`);
});
