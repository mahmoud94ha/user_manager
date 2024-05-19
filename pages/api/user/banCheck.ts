import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from "process";
import prisma from "@lib/authPrisma";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await banChecker(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function banChecker(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { re_p } = req.body;

        if (!re_p) {
            return res.status(403).json({});
        }

        const clientIP = Buffer.from(re_p, 'base64').toString('utf-8');

        const bannedCustomers = await prisma.customers.findMany({
            where: {
                banned: true,
                ip: clientIP
            }
        });

        if (bannedCustomers.length > 0) {
            return res.status(403).json({});
        } else {
            return res.status(200).json({});
        }
    } catch (error) {
        console.error('Error checking banned IP:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}