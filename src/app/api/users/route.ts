import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth, canCreateRole } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const userId = session.user.id
    const userRole = session.user.role

    // Build where clause based on user role
    let whereClause: Record<string, unknown> = {}

    if (userRole === "MASTER") {
      // Master can see all users
    } else if (userRole === "DISTRIBUTOR") {
      // Distributor can see direct children and grandchildren
      const directChildren = await prisma.user.findMany({
        where: { parentId: userId },
        select: { id: true },
      })
      const childIds = directChildren.map((c) => c.id)
      
      whereClause = {
        OR: [
          { parentId: userId },
          { parentId: { in: childIds } },
        ],
      }
    } else if (userRole === "AGENCY") {
      // Agency can only see direct children
      whereClause = { parentId: userId }
    } else {
      // Regular users can't see other users
      return NextResponse.json({ users: [], total: 0 })
    }

    // Add role filter
    if (role) {
      whereClause.role = role
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { loginId: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          parent: {
            select: { id: true, loginId: true, name: true, role: true },
          },
          subscriptions: {
            where: {
              status: "ACTIVE",
              endDate: { gte: new Date() },
            },
          },
          _count: {
            select: { children: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ])

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      users: sanitizedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { loginId, password, name, role, dailyRate, memo, subscriptions } = body

    const creatorRole = session.user.role

    // Check if user can create this role
    if (!canCreateRole(creatorRole, role)) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }

    // Check if loginId already exists
    const existingUser = await prisma.user.findUnique({
      where: { loginId },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        loginId,
        password: hashedPassword,
        name,
        role,
        parentId: session.user.id,
        dailyRate: role === "DISTRIBUTOR" ? dailyRate || 100000 : 0,
        memo,
      },
    })

    // Create initial subscriptions if provided
    if (subscriptions && subscriptions.length > 0) {
      await prisma.subscription.createMany({
        data: subscriptions.map((sub: { serviceType: string; startDate: string; endDate: string; isFreeTest?: boolean }) => ({
          userId: user.id,
          serviceType: sub.serviceType,
          startDate: new Date(sub.startDate),
          endDate: new Date(sub.endDate),
          status: "ACTIVE",
          isFreeTest: sub.isFreeTest || false,
          createdById: session.user.id,
        })),
      })
    }

    // Create log
    await prisma.log.create({
      data: {
        type: "USER_CREATED",
        creatorId: session.user.id,
        targetId: user.id,
        metadata: { role, loginId },
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}


