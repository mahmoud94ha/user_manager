import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/authMiddleware';
import { SendDB } from '@lib/mailer';
import { scheduleSummary, cancelSummary, scheduleBackup, cancelBackup } from '@lib/scheduler';
import prisma from '@lib/authPrisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const user: any = await withAuth(req, res);

            const { autoBackup, summaryEnabled, userNotification, notificationEmail } = req.body;

            const updatedSettings = await prisma.settings.upsert({
                where: { id: 1 },
                update: {
                    autoBackupEnabled: autoBackup?.autoBackupEnabled ?? false,
                    backupTimeout: autoBackup?.backupTimeout ?? null,
                    summaryEnabled: summaryEnabled ?? false,
                    userNotificationEnabled: userNotification?.userNotificationEnabled ?? false,
                    notificationEmail: notificationEmail ?? null,
                },
                create: {
                    autoBackupEnabled: autoBackup?.autoBackupEnabled ?? false,
                    backupTimeout: autoBackup?.backupTimeout ?? null,
                    summaryEnabled: summaryEnabled ?? false,
                    userNotificationEnabled: userNotification?.userNotificationEnabled ?? false,
                    notificationEmail: notificationEmail ?? null,
                },
            });

            if (autoBackup?.autoBackupEnabled) {
                scheduleBackup(autoBackup.backupTimeout, SendDB);
            } else {
                cancelBackup();
            }

            if (summaryEnabled) {
                await scheduleSummary();
            } else {
                cancelSummary();
            }

            res.status(200).json({ message: 'Settings updated successfully', settings: updatedSettings });
        } catch (error) {
            console.error('Error handling request:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
