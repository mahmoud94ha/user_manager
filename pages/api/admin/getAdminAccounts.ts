import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@lib/authMiddleware';
import { csrf } from "@lib/CustomCSRF";
import prisma from "@lib/authPrisma";

const getAccounts = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const user: any = await withAuth(req, res);

      const accounts = await prisma.customers.findMany();

      const updatedAccounts = await Promise.all(accounts.map(async (account) => {

        return {
          ...account,
          verified: account.verified ? true : false,
        };
      }));

      res.status(200).json(updatedAccounts);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default getAccounts;
