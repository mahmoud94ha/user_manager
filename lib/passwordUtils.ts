import bcrypt from 'bcrypt';
import prisma from "@lib/authPrisma";


const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}