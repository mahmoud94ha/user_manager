import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/authPrisma";
import { Prisma } from "@prismaAuthClient";
import { getCountryInfo } from "@lib/country-info";
import { hashPassword } from "@lib/passwordUtils";
import { generateVerificationToken } from '@lib/tokenGen';
import { sendVerificationEmail } from '@lib/mailer';
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
  const { name, email, password, re_r } = req.body;

  const clientIP = Buffer.from(re_r, 'base64').toString('utf-8');
  const location = await getCountryInfo(clientIP);

  if (password.length < 6) {
    errors.push("Password length should be more than 6 characters");
    return res.status(200).json({ errors });
  }

  try {
    const existingUser = await prisma.customers.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      errors.push("Email is already in use");
      return res.status(200).json({ errors });
    }

    console.log(name, email, password, clientIP);
    const hashedPassword = await hashPassword(password);
    const user = await prisma.customers.create({
      data: {
        username: name,
        email: email,
        password: hashedPassword,
        ip: clientIP,
        location: location,
        verified: false,
        online: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        ip: true,
        location: true,
        verified: true,
      },
    });

    if (user) {
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token,);
    }

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
