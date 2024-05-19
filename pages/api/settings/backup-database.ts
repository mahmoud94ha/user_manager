import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import { backupDatabase } from '@lib/backupDB';
import { resolve } from 'path';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {

            const user: any = await withAuth(req, res);

            const backupFilePath = await backupDatabase();

            const message = `Database backup is complete! \nRequested by: ${user.name}`;

            res.status(200).json(backupFilePath);

        } catch (error) {
            console.error('Error backing up database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
