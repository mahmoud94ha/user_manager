import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            await withAuth(req, res);

            const filePath = req.query.path as string;


            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.setHeader('Content-Disposition', 'attachment; filename=database_backup.sql');
            res.setHeader('Content-Type', 'application/octet-stream');
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Error downloading database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
