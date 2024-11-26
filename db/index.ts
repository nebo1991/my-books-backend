import { PrismaClient } from "@prisma/client";

// Instantiate PrismaClient
const prisma = new PrismaClient();

// Gracefully handle process exit
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Export the Prisma instance
export default prisma;
