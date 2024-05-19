import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@lib/authMiddleware';
import prisma from "@lib/authPrisma";
import { csrf } from "@lib/CustomCSRF";

async function deleteAccounts(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { accountIds } = req.body;

    try {
        const user: any = await withAuth(req, res);

        const AccountIdsAsInt = accountIds.map(id => parseInt(id, 10));

        const accountsToDelete = await prisma.customers.findMany({
            where: { id: { in: AccountIdsAsInt } },
        });

        if (accountsToDelete.length === 0) {
            return res.status(404).json({ message: "Accounts not found" });
        }

        await prisma.customers.deleteMany({
            where: { id: { in: AccountIdsAsInt } },
        });

        return res.status(200).json({ message: "Accounts deleted successfully" });

    } catch (error) {
        console.error("Error deleting Accounts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default deleteAccounts;
