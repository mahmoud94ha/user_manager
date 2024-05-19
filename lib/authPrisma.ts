import { PrismaClient as AuthPrismaClient } from '@prismaAuthClient';

const authPrismaClientSingleton = () => {
  return new AuthPrismaClient();
};

type AuthPrismaClientSingleton = ReturnType<typeof authPrismaClientSingleton>;

const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: AuthPrismaClientSingleton | undefined;
};

const authPrisma = globalForAuthPrisma.authPrisma ?? authPrismaClientSingleton();

export default authPrisma;

if (process.env.NODE_ENV !== 'production') globalForAuthPrisma.authPrisma = authPrisma;
