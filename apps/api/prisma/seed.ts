import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REGULAR_BENEFITS = [
  "Opportunities for professional development, mentoring & networking",
  "NAHCA webinar and conference fee discounts",
  "Opportunities to co-sponsor programming",
  "Access to specialized resources on Hindu spiritual care",
  "Support in pursuing professional credentialing",
].join("\n");

const PLANS = [
  {
    type: "regular" as const,
    name: "Regular Membership",
    priceCents: 7500,
    term: "per year",
    note: "Valid for 1 year from the date you join, with an automatic renewal option available when you sign up.",
    benefits: REGULAR_BENEFITS,
  },
  {
    type: "student" as const,
    name: "Student Membership",
    priceCents: 7500,
    term: "per 2 years",
    note: "Discounted 50% since it's valid for 2 years. Students receive all the benefits of a regular membership.",
    benefits: REGULAR_BENEFITS,
  },
  {
    type: "institutional" as const,
    name: "Institution-Sponsored Student Membership",
    priceCents: 0,
    term: "per student (min. 5)",
    note: "80% of the already-discounted student fee. Requires a minimum of 5 student memberships and applies to the membership fee only. Sponsored students gain a two-year student membership with the associated benefits.",
    benefits: REGULAR_BENEFITS,
    minStudents: 5,
    pricePerStudentCents: 6000,
  },
  {
    type: "conference" as const,
    name: "Conference Membership",
    priceCents: 7500,
    term: "per year",
    note: "A plan focused on attending NAHCA's conference programming throughout the year.",
    benefits: REGULAR_BENEFITS,
  },
];

async function main() {
  for (const plan of PLANS) {
    await prisma.membershipPlan.upsert({
      where: { type: plan.type },
      update: {},
      create: plan,
    });
  }
  console.log(`Seeded ${PLANS.length} membership plans.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
