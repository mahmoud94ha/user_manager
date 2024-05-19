import prisma from "@lib/authPrisma";
import { withAuth } from '@lib/authMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await withAuth(req, res, true);

        const customersCount = await prisma.customers.count();
        const usersCount = await prisma.user.count();
        const ticketsCount = await prisma.supportRequest.count();
        const bannedCustomersCount = await prisma.customers.count({ where: { banned: true } });
        const verfCustomersCount = await prisma.customers.count({ where: { verified: true } });
        const notverfCustomersCount = await prisma.customers.count({ where: { verified: false } });
        const repliedTicketsCount = await prisma.supportRequest.count({ where: { replyMessage: { not: null } } });

        const data = {
            customersCount,
            usersCount,
            ticketsCount,
            bannedCustomersCount,
            repliedTicketsCount,
            nonRepliedTicketsCount: ticketsCount - repliedTicketsCount,
            notBannedCustomersCount: customersCount - bannedCustomersCount,
            verfCustomersCount,
            notverfCustomersCount
        };

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
