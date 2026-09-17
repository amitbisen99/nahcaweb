import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { stripe } from "../lib/stripe";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { paymentsBypassed } from "../lib/paymentsBypass";
import { activatePayment } from "../lib/paymentActivation";

export const productsRouter = Router();

// Fields safe to show before purchase — never videoUrl/fileUrl, which stay
// hidden until the viewer has an active order (see the ownership check
// below), regardless of how the product was requested.
const publicProductSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  priceCents: true,
  published: true,
  createdAt: true,
} as const;

// ---- Public / buyer routes ----

productsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: publicProductSelect,
      orderBy: { createdAt: "desc" },
    });
    res.json({ products });
  })
);

async function hasActiveOrder(userId: number, productId: number): Promise<boolean> {
  const order = await prisma.productOrder.findFirst({
    where: { productId, buyerId: userId, status: "active" },
    select: { id: true },
  });
  return order !== null;
}

// optionalAuth: browsing a product's own page needs no account (matches the
// Forum's "public read" pattern) — only an actual purchase does. A logged-in
// viewer who already owns this product gets videoUrl/fileUrl included so
// the page can render the embed/download link directly; everyone else gets
// the same response with those fields left out, buy button shown instead.
productsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const isAdmin = req.auth?.role === "admin";
    if (!product.published && !isAdmin) return res.status(404).json({ error: "Product not found" });

    const owned = req.auth ? isAdmin || (await hasActiveOrder(req.auth.userId, id)) : false;

    const { videoUrl, fileUrl, ...publicFields } = product;
    res.json({ product: owned ? product : publicFields, owned });
  })
);

productsRouter.get(
  "/me/orders",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.productOrder.findMany({
      where: { buyerId: req.auth!.userId },
      include: { product: true, payment: { select: { status: true, amountCents: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Same rule as the single-product route: only an active order's own
    // buyer sees the actual videoUrl/fileUrl — a pending/abandoned order
    // (payment never completed) shows the product but no access fields.
    const withAccess = orders.map((o) => ({
      ...o,
      product: o.status === "active" ? o.product : { ...o.product, videoUrl: null, fileUrl: null },
    }));

    res.json({ orders: withAccess });
  })
);

function purchaseSuccessUrl(productId: number): string {
  return `${process.env.WEB_ORIGIN}/store/${productId}?status=success`;
}

// No guest checkout (unlike Donations/Events) — buying a digital product
// always requires an account, per explicit client decision, so this is
// requireAuth-only with no separate guest path. Idempotent: an existing
// active order for the same product is returned as-is rather than charging
// again; an abandoned pending attempt is retried fresh.
productsRouter.post(
  "/:id/purchase",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || !product.published) return res.status(404).json({ error: "Product not found" });

    const existing = await prisma.productOrder.findFirst({
      where: { productId: id, buyerId: req.auth!.userId, status: "active" },
    });
    if (existing) return res.status(200).json({ checkoutUrl: purchaseSuccessUrl(id) });

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const order = await prisma.productOrder.create({
      data: { productId: id, buyerId: user.id, status: "pending" },
    });

    const payment = await prisma.payment.create({
      data: {
        productOrderId: order.id,
        userId: user.id,
        type: "product",
        amountCents: product.priceCents,
        status: "pending",
      },
    });

    if (paymentsBypassed()) {
      await activatePayment(payment.id, `bypass-${Date.now()}`);
      return res.status(201).json({ checkoutUrl: purchaseSuccessUrl(id) });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: product.title },
            unit_amount: product.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: purchaseSuccessUrl(id),
      cancel_url: `${process.env.WEB_ORIGIN}/store/${id}?status=cancelled`,
      metadata: { paymentId: String(payment.id) },
    });

    await prisma.payment.update({ where: { id: payment.id }, data: { stripeRef: session.id } });

    res.status(201).json({ checkoutUrl: session.url });
  })
);

// ---- Admin ----

productsRouter.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ products });
  })
);

productsRouter.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ product });
  })
);

const productTypeSchema = z.enum(["video", "file"]);

const createProductSchema = z
  .object({
    type: productTypeSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    priceCents: z.number().int().min(1),
    videoUrl: z.string().url().optional(),
    fileUrl: z.string().min(1).optional(),
    published: z.boolean().default(false),
  })
  .refine((data) => (data.type === "video" ? !!data.videoUrl : !!data.fileUrl), {
    message: "A video product needs a video URL; a file product needs an uploaded file.",
  });

productsRouter.post(
  "/admin",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json({ product });
  })
);

const updateProductSchema = z.object({
  type: productTypeSchema.optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priceCents: z.number().int().min(1).optional(),
  videoUrl: z.string().url().nullable().optional(),
  fileUrl: z.string().min(1).nullable().optional(),
  published: z.boolean().optional(),
});

productsRouter.patch(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const updated = await prisma.product.update({ where: { id }, data: parsed.data });
    res.json({ product: updated });
  })
);

// A product with real orders can't be deleted outright — the DB's own
// foreign key (ProductOrder.productId is RESTRICT, not CASCADE) already
// prevents it, since a past buyer's order/access must never dangle;
// unpublishing hides it from the store instead. Caught here to turn that
// into a clear message rather than a raw constraint-violation 500.
productsRouter.delete(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    try {
      await prisma.product.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        return res
          .status(400)
          .json({ error: "This product has existing orders and can't be deleted — unpublish it instead." });
      }
      throw err;
    }

    res.status(204).end();
  })
);

// ---- File upload for "file"-type products ----
// Deliberately separate from routes/uploads.ts's generic content-image
// upload (10MB, images/PDF only) rather than raising that shared limit —
// nothing else needs 50MB or arbitrary file types, and this endpoint is
// itself admin-only anyway.
const productUploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(productUploadsDir)) {
  fs.mkdirSync(productUploadsDir, { recursive: true });
}

// "Any file" per explicit client request, with a denylist for
// executable/script types — not because a buyer's browser would run them
// (Express serves everything from /uploads as a plain static file), but as
// basic defense in depth against an accidental upload of something that
// could be actively harmful if ever downloaded and run, or that this app's
// own static file server would render as HTML/SVG on the same origin
// (a real stored-XSS vector if it ever happened) rather than a good format
// for a purchasable digital product.
const BLOCKED_EXTENSIONS = /\.(exe|dll|bat|cmd|msi|sh|php\d?|phtml|jsp|asp|aspx|cgi|pl|py|js|mjs|html?|svg)$/i;

const productUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, productUploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (BLOCKED_EXTENSIONS.test(file.originalname)) {
      cb(new Error("That file type isn't allowed."));
    } else {
      cb(null, true);
    }
  },
});

productsRouter.post(
  "/admin/upload",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    productUpload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || "Upload failed." });
      next();
    });
  },
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  }
);
