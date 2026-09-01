import { PrismaClient } from "@prisma/client";
import { withDbRetry } from "./lib/dbRetry";

// A brief, unretried Prisma connection hiccup ("Can't reach database
// server at `localhost:3306`" — most likely MySQL closing an idle
// connection before Prisma's pool noticed it was stale, see
// lib/dbRetry.ts for the full explanation) used to crash whichever route
// happened to run a query at the wrong moment. Hand-wrapping individual
// call sites with withDbRetry() kept missing routes — that's exactly how
// this kept resurfacing ("almost everywhere" in the admin panel: event/
// coupon details, member list, event list, ...). Applying the same
// one-retry policy here instead, via Prisma's own query extension,
// covers every model and every route uniformly, including any added
// later, without relying on remembering to wrap each new query.
//
// Only read operations are retried — a write retried blindly after a
// dropped connection risks a duplicate record if it actually reached the
// database and only the response back was lost.
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
  name: "db-retry",
  query: {
    $allModels: {
      $allOperations({ operation, args, query }) {
        if (!READ_OPERATIONS.has(operation)) return query(args);
        return withDbRetry(() => query(args));
      },
    },
  },
});
