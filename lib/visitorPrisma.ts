// authPrisma.ts
import { PrismaClient as visitorPrismaClient } from '@prismaAuthClient';

const visitorPrismaClientSingleton = () => {
  return new visitorPrismaClient();
};

type AuthPrismaClientSingleton = ReturnType<typeof visitorPrismaClientSingleton>;

const globalVisitorPrisma = globalThis as unknown as {
  visitorPrisma: AuthPrismaClientSingleton | undefined;
};

const visitorPrisma = globalVisitorPrisma.visitorPrisma ?? visitorPrismaClientSingleton();

export default visitorPrisma;

if (process.env.NODE_ENV !== 'production') globalVisitorPrisma.visitorPrisma = visitorPrisma;
