import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import prisma from '@lib/authPrisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            await withAuth(req, res);

            const settingName = req.query.setting as string;

            if (!settingName) {
                return res.status(400).json({ error: 'Setting name is required in the query parameter' });
            }

            const settings = await prisma.settings.findFirst({
                where: { id: 1 },
            });

            if (!settings) {
                return res.status(404).json({ error: 'Settings not found' });
            }

            if (settingName.toLowerCase() === 'all') {
                return res.status(200).json(settings);
            }

            const settingPathArray = settingName.split('.');
            let currentSetting: any = settings;

            for (const pathSegment of settingPathArray) {
                if (!(pathSegment in currentSetting)) {
                    return res.status(404).json({ error: 'Setting not found' });
                }

                currentSetting = currentSetting[pathSegment];
            }

            res.status(200).json(currentSetting);

        } catch (error) {
            console.error('Error handling request:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
