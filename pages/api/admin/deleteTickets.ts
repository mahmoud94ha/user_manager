import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/prisma';
import { withAuth } from '@lib/authMiddleware';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const user = await withAuth(req, res, true);

    if (!user || user.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const { ticketIds } = req.body;

            if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
                return res.status(400).json({ error: 'Invalid ticket IDs' });
            }

            const ticketIdsInt = ticketIds.map(id => parseInt(id, 10));

            await prisma.supportRequest.deleteMany({
                where: { id: { in: ticketIdsInt } },
            });

            return res.status(200).json({});
        } catch (error) {
            console.error('Error deleting support requests:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
