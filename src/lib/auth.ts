import NextAuth from "next-auth"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"
import type { UserRole } from "@prisma/client"

// Extend the types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      loginId: string
      name: string
      role: UserRole
    }
  }
  interface User {
    id: string
    loginId: string
    name: string
    role: UserRole
  }
}

const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Full credentials object:", JSON.stringify(credentials, null, 2))
        
        const loginId = credentials?.loginId
        const password = credentials?.password
        
        console.log("[AUTH] authorize called with loginId:", loginId)
        
        if (!loginId || !password) {
          console.log("[AUTH] Missing credentials - loginId:", loginId, "password exists:", !!password)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { loginId: loginId as string },
        })

        console.log("[AUTH] User found:", user?.loginId, user?.isActive)

        if (!user || !user.isActive) {
          console.log("[AUTH] User not found or inactive")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password as string,
          user.password
        )

        console.log("[AUTH] Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password")
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Create login log
        await prisma.log.create({
          data: {
            type: "LOGIN",
            creatorId: user.id,
            targetId: user.id,
          },
        })

        return {
          id: user.id,
          loginId: user.loginId,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.loginId = (user as User).loginId
        token.role = (user as User).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.loginId = token.loginId as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)

// Helper function to check if user can create a specific role
export function canCreateRole(creatorRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy: Record<UserRole, UserRole[]> = {
    MASTER: ['DISTRIBUTOR', 'AGENCY', 'USER'],
    DISTRIBUTOR: ['AGENCY', 'USER'],
    AGENCY: ['USER'],
    USER: [],
  }
  return hierarchy[creatorRole]?.includes(targetRole) ?? false
}

// Helper function to check if user can manage a target user
export async function canManageUser(userId: string, targetId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return false
  if (user.role === 'MASTER') return true

  // Check if target is in user's hierarchy
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { parentId: true, parent: { select: { parentId: true } } },
  })

  if (!target) return false

  // Direct child
  if (target.parentId === userId) return true

  // Grandchild (for distributors managing agency's users)
  if (target.parent?.parentId === userId) return true

  return false
}
