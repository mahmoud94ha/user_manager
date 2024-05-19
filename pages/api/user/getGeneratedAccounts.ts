import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@lib/authMiddleware";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";
import { csrf } from "@lib/CustomCSRF";

async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await getAccountsHandler(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function getAccountsHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await withAuth(req, res);

        const accounts = await prisma.user.findMany({
            where: {
                NOT: {
                    plainPassword: null,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                plainPassword: true,
                createdAt: true,
                role: true,
            },
        });

        return res.status(200).json([...accounts ]);
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ message: e.message });
        }
    }
}

export default handle;
