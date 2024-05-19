import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import { checkFileExists } from '@lib/dbVerifier';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            await withAuth(req, res);

            const fileLink = await checkFileExists();

            if (fileLink) {
                return res.status(200).json({ link: fileLink });
            } else {
                return res.status(404).json({ error: 'File not found' });
            }

        } catch (error) {
            console.error('Error checking file existence:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
