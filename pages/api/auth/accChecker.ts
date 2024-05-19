import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@lib/authMiddleware";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";

// scraped for now , bad logic
async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await accountChecker(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function accountChecker(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { re_c, email } = req.body;
        const clientIP = Buffer.from(re_c, 'base64').toString('utf-8');

        if (!email || !re_c) {
            return res.status(400).json({});
        }

        console.log(email, clientIP);

        const bannedCustomer = await prisma.customers.findUnique({
            where: {
                email: email
            }
        });

        if (bannedCustomer && bannedCustomer.banned) {
            await prisma.bannedIP.create({
                data: {
                    ipAddress: clientIP
                }
            });

            return res.status(400).json({});
        }

        return res.status(400).json({});

    } catch (e) {
        console.error("Error while checking account:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default handle;
