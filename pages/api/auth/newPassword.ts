import { getPasswordResetTokenByToken } from "@lib/password-reset-token";
import { hashPassword } from '@lib/passwordUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@lib/authPrisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'token is required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'password length should be more than 6 characters' })
    }

    try {
        const verificationToken = await getPasswordResetTokenByToken(token);

        if (!verificationToken) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const user_email: string = verificationToken.email
        const hashedPassword = await hashPassword(password);

        await prisma.customers.update({
            where: { email: user_email },
            data: { password: hashedPassword },
        });

        await prisma.passwordResetToken.delete({
            where: { token: token },
        });

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
