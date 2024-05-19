// generalPrisma.ts
import { PrismaClient as ClientPrisma } from '@prismaAuthClient';

const generalPrismaClientSingleton = () => {
  return new ClientPrisma();
};

type GeneralPrismaClientSingleton = ReturnType<typeof generalPrismaClientSingleton>;

const globalForGeneralPrisma = globalThis as unknown as {
  generalPrisma: GeneralPrismaClientSingleton | undefined;
};

const generalPrisma = globalForGeneralPrisma.generalPrisma ?? generalPrismaClientSingleton();

export default generalPrisma;

if (process.env.NODE_ENV !== 'production') globalForGeneralPrisma.generalPrisma = generalPrisma;
