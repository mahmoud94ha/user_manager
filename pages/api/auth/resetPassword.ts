import { NextApiRequest, NextApiResponse } from 'next';
import { generatePasswordResetToken } from '@lib/tokenGen';
import { sendPasswordResetEmail } from '@lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const verificationToken = await generatePasswordResetToken(email);

        await sendPasswordResetEmail(verificationToken.email, verificationToken.token,);

        return res.status(200).json({ message: "If your email is valid an email will be sent" });
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
