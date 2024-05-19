import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSupportTicket } from '@lib/mailer';
import prisma from '@lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { subject, message, accountEmail } = req.body;

            if (!subject || !message) {
                res.status(400).json({ error: "Subject and message are required." });
                return;
            }

            const isAccountLegit = await prisma.customers.findUnique({ where: { email: accountEmail } })

            if (!isAccountLegit) {
                res.status(400).json({ error: "An error occured" });
                return;
            }

            const ticket = await prisma.supportRequest.findUnique({ where: { accountEmail: accountEmail } })

            if (ticket) {
                res.status(400).json({ error: "You already have an open support ticket." });
                return;
            }

            await prisma.supportRequest.create({
                data: {
                    accountEmail,
                    subject,
                    message,
                },
            });

            await sendSupportTicket("Your request have been received", "We will get back to you as soon as possible!", accountEmail) // to user
            await sendSupportTicket(subject, message, "usermanager@user-management.com") // to system

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error creating support request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
