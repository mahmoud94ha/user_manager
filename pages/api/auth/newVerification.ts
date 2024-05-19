import { getVerificationTokenByToken } from "@lib/verificiation-token";
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/authPrisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const verificationToken = await getVerificationTokenByToken(token);

        if (!verificationToken) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const user_email: string = verificationToken.email

        await prisma.customers.update({
            where: { email: user_email },
            data: { verifiedAt: new Date(), verified: true },
        });

        await prisma.verificationToken.delete({
            where: { token: token },
        });

        return res.status(200).json({ success: true, message: 'Email verification successful' });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
