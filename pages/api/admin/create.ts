import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";
import { hashPassword } from "@lib/passwordUtils";
import { csrf } from "@lib/CustomCSRF";

async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await createUserHandler(req, res);
  } else {
    return res.status(405).json({ message: "Method Not allowed" });
  }
}

async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
  let errors: string[] = [];
  const { name, email, password, secret } = req.body;

  if (password.length < 6) {
    errors.push("Password length should be more than 6 characters");
    return res.status(400).json({ errors });
  }

  try {
    if (
      secret !== process.env.ADMIN_SECRET &&
      secret !== process.env.USER_SECRET
    ) {
      errors.push("Invalid Secret");
      return res.status(400).json({ errors });
    }

    const role = secret === process.env.ADMIN_SECRET ? "admin" : "user";

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      errors.push("Email is already in use");
      return res.status(400).json({ errors });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.status(201).json({ user, created: true });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res.status(400).json({ message: e.message });
      }
      return res.status(400).json({ message: e.message });
    }
  }
}

export default handle;
