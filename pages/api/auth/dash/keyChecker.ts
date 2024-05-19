import { NextApiRequest, NextApiResponse } from "next";

async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        await verifyKeyHandler(req, res);
    } else {
        return res.status(405).json({ message: "Method Not allowed" });
    }
}

async function verifyKeyHandler(req: NextApiRequest, res: NextApiResponse) {
    const { secret } = req.body;
    const adminDashSecret = process.env.ADMIN_DASH_SECRET;

    if (!secret || secret !== adminDashSecret) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const isValidKey = secret === adminDashSecret;

        if (isValidKey) {
            return res.status(200).json({ key: secret });
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error while verifying key:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default handle;
