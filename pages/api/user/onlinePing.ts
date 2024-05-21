import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';
import { withAuth } from '@lib/authMiddleware';

const pingedEmails = new Map<string, NodeJS.Timeout>();

const updateUserStatus = async (email: string, online: boolean, isCustomer: boolean) => {
  try {
    if (isCustomer) {
      await prisma.customers.update({
        where: { email },
        data: { online },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: { online },
      });
    }

    if (online) {
      const task = setTimeout(async () => {
        if (isCustomer) {
          await prisma.customers.update({
            where: { email },
            data: { online: false },
          });
        } else {
          await prisma.user.update({
            where: { email },
            data: { online: false },
          });
        }
        pingedEmails.delete(email);
      }, 30000);
      pingedEmails.set(email, task);
    } else {
      const task = pingedEmails.get(email);
      if (task) {
        clearTimeout(task);
        pingedEmails.delete(email);
      }
    }
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { re_o, re_i } = req.body;

      if (re_i) {
        let findCustomer = await prisma.customers.findUnique({ where: { email: re_i } });
        let findUser = await prisma.user.findUnique({ where: { email: re_i } });

        if (findCustomer) {
          await updateUserStatus(re_i, re_o, true);
        } else if (findUser) {
          await updateUserStatus(re_i, re_o, false);
        }

        return res.status(200).json({});
      } else {
        return res.status(200).json({});
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(200).json({});
    }
  } else {
    return res.status(200).json({});
  }
}
