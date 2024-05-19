import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@lib/authMiddleware";
import prisma from "@lib/authPrisma";
import { csrf } from "@lib/CustomCSRF";
import { Prisma } from "@prismaAuthClient";

async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await updateAccountStatusHandler(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function updateAccountStatusHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let errors: string[] = [];

    try {
        await withAuth(req, res);

        const { accountid, verified } = req.body;
        console.log(accountid, verified)

        if (!accountid || verified == null) {
            errors.push("Invalid request parameters");
            return res.status(400).json({ errors });
        }

        const updatedccount = await prisma.customers.update({
            where: { id: accountid },
            data: {
                verified: !verified,
            },
        });

        return res.status(200).json({ eAccount: updatedccount });
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ message: e.message });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default handle;
