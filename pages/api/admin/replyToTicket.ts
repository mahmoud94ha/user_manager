import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSupportTicket } from '@lib/mailer';
import { withAuth } from '@lib/authMiddleware';
import prisma from '@lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { email, replyMessage } = req.body;

            const user: any = await withAuth(req, res);

            if (!email || !replyMessage) {
                res.status(400).json({ error: "Email or replyMessage not supplied" });
                return;
            }

            const updatedTicket = await prisma.supportRequest.update({
                where: { accountEmail: email },
                data: { replyMessage, repliedByUser: user.name },
            });

            await sendSupportTicket("Replied to your ticket", replyMessage, email) // to user
            await sendSupportTicket(`Replied to ${email}'s ticket`, replyMessage, "usermanager@user-management.com") // to system

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error creating support request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

