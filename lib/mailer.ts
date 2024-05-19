import { Resend } from 'resend';
import prisma from "@lib/authPrisma";
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { checkFileExists } from "@lib/dbVerifier";
import { backupDatabase } from './backupDB';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.URL;
const readFile = promisify(fs.readFile);

const getEmail = async () => {
  const email = await prisma.settings.findFirst({});
  return email.notificationEmail;
}

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`
  console.log(resetLink);

  await resend.emails.send({
    from: "usermanager@user-management.com",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  });
};

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${domain}/auth/verify-account?token=${token}`;
  console.log(confirmLink);

  await resend.emails.send({
    from: "usermanager@user-management.com",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  });
};

export const sendSupportTicket = async (
  subject: string,
  message: string,
  email: string
) => {
  await resend.emails.send({
    from: "usermanager@user-management.com",
    to: email,
    subject: "New Support ticket: " + subject,
    html: message
  });
};

export const SendMail = async (
  subject: string,
  message: string,
  email: string
) => {
  await resend.emails.send({
    from: "usermanager@user-management.com",
    to: email,
    subject: subject,
    html: message
  });
};

export const SendDB = async () => {
  const fileLink = await checkFileExists();
  const filePath = path.resolve(fileLink);
  const fileName = path.basename(filePath);
  const fileBuffer = await readFile(filePath);

  const message = `
    <p>Dear Admin,</p>
    <p>Please find attached the scheduled backup of the UserManager database.</p>
    <p>Best regards,<br>UserManager Team</p>
  `;

  await backupDatabase();

  await resend.emails.send({
    from: "usermanager@user-management.com",
    to: await getEmail(),
    subject: "Scheduled UserManager Database Backup",
    html: message,
    attachments: [
      {
        filename: fileName,
        content: fileBuffer.toString('base64'),
      },
    ],
  });
};
