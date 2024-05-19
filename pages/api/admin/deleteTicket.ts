
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
            const { ticketId } = req.body;
            await prisma.supportRequest.delete({
                where: { id: ticketId },
            });
            return res.status(200).json({});
        } catch (error) {
            console.error('Error fetching support requests:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
