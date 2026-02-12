import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@fidevoltz/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  trustHost: true, // Required for Next.js 16
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Auth: Missing credentials");
          return null;
        }

        try {
          console.log("🔐 Auth: Attempting login for:", credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log("❌ Auth: User not found:", credentials.email);
            return null;
          }

          if (user.isBanned) {
            console.log("❌ Auth: User is banned:", user.email);
            throw new Error("Your account has been banned.");
          }

          if (user.status === 'pending_verification') {
            console.log("❌ Auth: Email not verified:", user.email);
            throw new Error("Please verify your email before logging in.");
          }

          if (user.status !== 'active') {
            console.log("❌ Auth: Account is not active:", user.email);
            throw new Error("Your account is currently inactive.");
          }

          console.log("✅ Auth: User found:", user.email, "Role:", user.role);

          const isPasswordValid = await compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log("❌ Auth: Invalid password for:", credentials.email);
            return null;
          }

          console.log("✅ Auth: Password valid, returning user");
          
          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role,
            avatar: user.avatar || null,
            image: user.avatar || null, // Ensure standard field is also set
          } as any;
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session update trigger (when update() is called)
      if (trigger === "update" && session?.user) {
        console.log("🔄 JWT callback - Session update triggered");
        
        // Fetch fresh user data from database
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
          },
        });

        if (updatedUser) {
          console.log("✅ JWT callback - Updated user data:", updatedUser.email);
          token.id = updatedUser.id;
          token.role = updatedUser.role as Role;
          token.image = updatedUser.avatar;
          token.avatar = updatedUser.avatar; // Update this too
          token.name = updatedUser.name;
        }
      }
      
      if (user) {
        console.log("🎫 JWT callback - Adding user to token:", user.email);
        token.id = user.id;
        token.role = user.role as Role;
        token.image = user.image || (user as any).avatar; // Handle both
        token.avatar = (user as any).avatar || user.image;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("📝 Session callback - Creating session for:", token.email);
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.image = token.image as string | null;
        (session.user as any).avatar = token.avatar as string | null; // Pass to client
        session.user.name = token.name as string | null;
      }
      console.log("✅ Session created with role:", session.user.role);
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
});
