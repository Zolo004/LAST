import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 🔹 NextAuth-н хэрэглэгчийн төрлийг тодорхойлох
declare module "next-auth" {
  interface User {
    id: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    };
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 🔹 Credentials (нэр, нууц үгээр) нэвтрэх
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Буруу мэдээлэл оруулсан байна!");
        }

        // 📌 Хэрэглэгч хайх
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Хэрэглэгч олдсонгүй!");
        }

        // 📌 Нууц үг тааруулах
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Нууц үг буруу байна!");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),

    // 🔹 Google нэвтрэлт
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔹 Github нэвтрэлт
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // JWT token callback
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = "JWT"; // хэрэгцээт accessToken-г хадгалах
      }
      return token;
    },
    // Session callback
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt", // Session-ийг JWT хэлбэрээр хадгалах
  },

  secret: process.env.NEXTAUTH_SECRET, // 🔐 NextAuth-д шаардлагатай нууц үг

  pages: {
    signIn: "/login", // Нэвтэрэх хуудас
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
