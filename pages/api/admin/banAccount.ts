import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@lib/authMiddleware";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";

async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await setAccountDoneHandler(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function setAccountDoneHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let errors: string[] = [];

    try {
        const user: any = await withAuth(req, res, true);

        const { accountId, admin_reset, banMessage } = req.body;

        if (user.role === "user") {
            if (!banMessage) {
                return res.status(400).json({ message: "Ban message is required for users" });
            }
        }

        if (!accountId) {
            errors.push("Invalid request parameters");
            return res.status(400).json({ errors });
        }


        if (user.role === "admin" || user.role === "user") {

            const currentAccount = await prisma.customers.findUnique({
                where: { id: accountId },
              });

            const updatedAccount = await prisma.customers.update({
                where: { id: accountId },
                data: {
                    banned: admin_reset ? false : true,
                    online: admin_reset ? currentAccount.online : false,
                },
            });

            return res.status(200).json({ account: updatedAccount });
        }

        return res.status(400).json({ message: "" });

    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ message: e.message });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default handle;
