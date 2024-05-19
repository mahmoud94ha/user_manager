import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/authPrisma";
import { withAuth } from '@lib/authMiddleware';
import { csrf } from "@lib/CustomCSRF";

async function deleteUsers(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userIds } = req.body;

    try {
        const user: any = await withAuth(req, res);

        const usersToDelete = await prisma.user.findMany({
            where: { id: { in: userIds } },
        });

        if (usersToDelete.length === 0) {
            return res.status(404).json({ message: "Users not found" });
        }

        const adminUsers = usersToDelete.filter(user => user.role === "admin");

        if (user.id !== process.env.OWNERID) {
            if (adminUsers.length > 0) {
                return res.status(400).json({ message: "Cannot delete admin users." });
            }
        }

        await prisma.user.deleteMany({
            where: { id: { in: userIds } },
        });

        return res.status(200).json({ message: "Users deleted successfully" });
    } catch (error) {
        console.error("Error deleting users:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default deleteUsers;
