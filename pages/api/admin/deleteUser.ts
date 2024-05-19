import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/authPrisma";
import { withAuth } from '@lib/authMiddleware';
import { csrf } from "@lib/CustomCSRF";

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { userId } = req.body;

    try {
        const user: any = await withAuth(req, res);

        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: true,
            },
        });

        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.id !== process.env.OWNERID) {
            if (userToDelete.role === "admin") {
                return res.status(400).json({ message: "Cannot delete an admin user." });
            }
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default deleteUser;
