import schedule from 'node-schedule';
import { SendMail } from '@lib/mailer';
import prisma from "@lib/authPrisma";

let backupJob: schedule.Job | null = null;

export const scheduleBackup = (intervalMinutes: number, backupFunction: () => void): void => {
    cancelBackup();
    backupFunction();
    backupJob = schedule.scheduleJob(`*/${intervalMinutes} * * * *`, backupFunction);
};

export const cancelBackup = (): void => {
    if (backupJob) {
        backupJob.cancel();
        backupJob = null;
    }
};

let summaryJob: schedule.Job | null = null;

export const scheduleSummary = async (): Promise<void> => {
    cancelSummary();
    await sendSummary();
    // 0 0 * * * // every midnight
    // * * * * * // every min
    summaryJob = schedule.scheduleJob('* * * * *', sendSummary);

};

// export const scheduleSummary = async (): Promise<void> => {
//     cancelSummary();
//     await sendSummary();
//     summaryJob = schedule.scheduleJob('*/10 * * * * *', sendSummary);
// };

export const cancelSummary = (): void => {
    if (summaryJob) {
        summaryJob.cancel();
        summaryJob = null;
    }
};

const getEmail = async () => {
    const email = await prisma.settings.findFirst({});
    return email.notificationEmail;
}

const sendSummary = async (): Promise<void> => {
    try {
        const now = new Date();
        const last24Hours = new Date(now);
        last24Hours.setHours(now.getHours() - 24);

        const totalViewers = await prisma.visitor.count({
            where: {
                dateVisited: {
                    gte: last24Hours,
                    lte: now,
                },
            },
        });

        const pageCounts = await prisma.visitor.groupBy({
            by: ['lastPage'],
            _count: true,
            where: {
                dateVisited: {
                    gte: last24Hours,
                    lte: now,
                },
            },
        });

        const last24HoursAccounts = await prisma.customers.count({
            where: {
                createdAt: {
                    gte: last24Hours,
                    lte: now,
                },
            },
        });

        const last24HoursVerifiedAccounts = await prisma.customers.count({
            where: {
                createdAt: {
                    gte: last24Hours,
                    lte: now,
                },
                verified: true,
            },
        });

        const last24HoursNotVerAccounts = await prisma.customers.count({
            where: {
                createdAt: {
                    gte: last24Hours,
                    lte: now,
                },
                verified: false,
            },
        });

        const last24HoursBannedAccounts = await prisma.customers.count({
            where: {
                createdAt: {
                    gte: last24Hours,
                    lte: now,
                },
                banned: true,
            },
        });

        const formattedPageCounts = pageCounts.map((pageCount) => {
            const pageName = pageCount.lastPage || 'Unknown Page';
            const viewerCount = pageCount._count || 0;
            return `    - ${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace("-", " ")}: ${viewerCount}`;
        });

        const summaryMessage = `
  <html>
    <body>
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f499b;">📋 User Manager 24 hours Summary 📋</h2>
        <p style="font-size: 16px;">
          <strong>👀 Total Visitors:</strong> ${totalViewers}
        </p>
        <h3 style="color: #4f499b;">📊 Pages visited counters:</h3>
        <p style="font-size: 16px;">
          ${formattedPageCounts ? formattedPageCounts.join('<br>') : "No visitors today"}
        </p>
        <h3 style="color: #4f499b;">📈 Customer stats (last 24 hours):</h3>
        <p style="font-size: 16px;">
          <strong>🔑 Created:</strong> ${last24HoursAccounts}<br>
          <strong>✔️ Verified:</strong> ${last24HoursVerifiedAccounts}<br>
          <strong>❌ None verified:</strong> ${last24HoursNotVerAccounts}<br>
          <strong>🚫 Banned Customers:</strong> ${last24HoursBannedAccounts}
        </p>
      </div>
    </body>
  </html>
`;

        await SendMail("24 hours UM Summary", summaryMessage, await getEmail());
        console.log(summaryMessage);
    } catch (error) {
        console.error('Error sending summary:', error);
    }
};
