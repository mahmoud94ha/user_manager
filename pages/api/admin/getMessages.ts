import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import prisma from '@lib/prisma';

const getMessages = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const user: any = await withAuth(req, res, true);
        const userId = req.query.userId || user.id;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default getMessages;
