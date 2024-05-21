import { NextApiRequest, NextApiResponse } from "next";
import { csrf } from "@lib/CustomCSRF";
import prisma from "@lib/authPrisma";
import { withAuth } from '@lib/authMiddleware';

const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const user: any = await withAuth(req, res);

      const userId = user.id;

      let reqUser: any;

      reqUser = await prisma.user.findMany({
        where: {
          id: {
            not: userId,
          },
        },
      });

      if (!reqUser) {
        return res.status(404).json({ error: "Users not found" });
      }

      const finalUser = reqUser.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        plainPassword: user.plainPassword,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        online: user.online,
      }));

      return res.status(200).json(finalUser);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to retrieve user" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default getUser;
