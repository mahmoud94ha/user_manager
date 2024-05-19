import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "@lib/passwordUtils";
import { exclude } from "@lib/filterUser";
import { PrismaClient } from "@prismaAuthClient";
import prisma from "@lib/authPrisma";

export const authOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let _user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!_user) {
          _user = await prisma.customers.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (
            _user &&
            (await comparePassword(credentials.password, _user.password))
          ) {

            if (_user?.verified === false) {
              throw new Error("Email not verified, please verify it first!");
            }

            if (_user?.banned === true) {
              throw new Error(`You have been banned for :${_user?.banMessage}`);
            }
          }

          if (!_user) {
            return null;
          }
        }

        const user = exclude(_user, ["password"]);

        if (
          user &&
          (await comparePassword(credentials.password, _user.password))
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/dashboard",
    error: "/admin/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.token,
          refreshToken: user.refreshToken,
          user,
        };
      }
      return token;
    },
    async session({ session, token }) {
      let _user;
      const { user } = token;
      if (user) {
        session.user = user;
        _user = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        if (!_user) {
          _user = await prisma.customers.findUnique({
            where: {
              email: user.email,
            },
          });

          if (_user && _user?.banned) {
            throw new Error(`You have been banned for :${_user?.banMessage}`);
          }
        }
        if (_user) {
          session.user = token.user;
          return session;
        }
      }

      return _user;
    },
  },
  cors: {
    origin: process.env.URL,
  },
};

export default NextAuth(authOptions);
