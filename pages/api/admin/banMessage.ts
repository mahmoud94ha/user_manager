import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/authPrisma";
import { withAuth } from "@lib/authMiddleware";

async function setAccountBanMessage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { accountId, banMessage, by_user } = req.body;

    if (!accountId || !banMessage || !by_user) {
        return res.status(404).json({ message: "Missing fields" });
    }

    try {
        const user: any = await withAuth(req, res, true);


        if (user.role === "admin" || user.role === "user") {
            await prisma.customers.update({
                where: { id: accountId },
                data: {
                    by_user: by_user,
                    banMessage: banMessage === "admin_reset" ? null : banMessage,
                },
            });
            return res.status(200).json({ message: "Ban message set successfully" });
        }

        return res.status(400).json({ message: "" });


    } catch (error) {
        console.error("Error setting done message:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default setAccountBanMessage;
