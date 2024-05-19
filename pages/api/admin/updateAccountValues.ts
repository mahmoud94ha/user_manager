import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@lib/authMiddleware";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";

async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await updateAccountValuesHandler(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function updateAccountValuesHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let errors: string[] = [];

    try {
        await withAuth(req, res);

        const { accountId, field, value } = req.body;

        if (!accountId || !field || value == null) {
            errors.push("Invalid request parameters");
            return res.status(400).json({ errors });
        }

        const fieldMappings = {
            email: 'email',
            password: 'password',
            location: 'location',
            ip: 'ip',
            username: 'username',
        };

        const prismaField = fieldMappings[field];

        if (!prismaField) {
            errors.push("Invalid field name");
            return res.status(400).json({ errors });
        }

        const updatedAccount = await prisma.customers.update({
            where: { id: accountId },
            data: {
                [prismaField]: value,
            },
        });

        return res.status(200).json({ eAccount: updatedAccount });
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ message: e.message });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default handle;
