import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from "process";
import prisma from "@lib/authPrisma";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await returnBannedIPS(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function returnBannedIPS(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { key } = req.body;

        if (key !== env.MIDDLEWARE_SECRET) {
            return res.status(405).json({ message: "" });
        }

        const bannedCustomers = await prisma.customers.findMany({
            where: {
                banned: true,
                ip: {
                    not: null
                }
            },
            select: {
                ip: true
            }
        });

        const bannedIpsFromCustomers = bannedCustomers.map(customer => customer.ip);
        const bannedIPsFromBannedIPTable = await prisma.bannedIP.findMany({
            select: {
                ipAddress: true
            }
        });

        const bannedIpsFromBannedIPTable = bannedIPsFromBannedIPTable.map(entry => entry.ipAddress);
        const combinedBannedIps = [...bannedIpsFromCustomers, ...bannedIpsFromBannedIPTable];
        const uniqueBannedIps = Array.from(new Set(combinedBannedIps));

        res.status(200).json({ bannedIps: uniqueBannedIps });
    } catch (error) {
        console.error('Error fetching banned IPs:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
